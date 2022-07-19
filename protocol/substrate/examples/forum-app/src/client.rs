use crate::content::*;
use async_recursion::async_recursion;
use codec::Decode;
use frame_support::BoundedVec;
use sauron::prelude::*;
use serde_json::json;
use std::collections::BTreeMap;
use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;

#[wasm_bindgen]
extern "C" {

    #[derive(Debug, Clone)]
    pub type PolywrapClientWrapper;

    #[wasm_bindgen(constructor)]
    pub fn new() -> PolywrapClientWrapper;

    #[wasm_bindgen(method)]
    pub async fn invoke_method(
        this: &PolywrapClientWrapper,
        method: &str,
        args: JsValue,
    ) -> JsValue;

    #[wasm_bindgen(method)]
    pub async fn invoke(this: &PolywrapClientWrapper, args: JsValue) -> JsValue;
}

const FORUM_MODULE: &str = "ForumModule";
const ALL_POSTS: &str = "AllPosts";
const ALL_COMMENTS: &str = "AllComments";
const KIDS: &str = "Kids";

#[derive(Clone)]
pub struct Api {
    client: PolywrapClientWrapper,
    url: String,
}

impl Api {
    pub fn new(url: &str) -> Self {
        Self {
            client: PolywrapClientWrapper::new(),
            url: url.to_string(),
        }
    }

    pub async fn get_post_list(&self) -> Result<Vec<PostDetail>, crate::Error> {
        let mut all_post = Vec::with_capacity(10);
        log::info!("---->Getting all the post_id...");
        let next_to: Option<u32> = None;

        let args = json!({
            "url": self.url,
            "pallet": FORUM_MODULE,
            "storage": ALL_POSTS,
            "count": 20,
            "nextTo": None::<u32>,
        });

        let args = JsValue::from_serde(&args).expect("must convert");
        let result = self.client.invoke_method("getStorageMapPaged", args).await;
        log::info!("result in post list: {:#?}", result);
        let storage_values: Option<Vec<Vec<u8>>> = result.into_serde()?;

        log::info!("here..");
        if let Some(storage_values) = storage_values {
            for (i, bytes) in storage_values.into_iter().enumerate() {
                log::info!("At post: {}", i);
                let post: Option<Post> = Post::decode(&mut bytes.as_slice()).ok();
                log::info!("post: {:#?}", post);
                if let Some(post) = post {
                    let reply_count = self.get_reply_count(post.post_id).await?;
                    all_post.push(PostDetail {
                        post,
                        reply_count,
                        comments: vec![],
                    });
                }
            }
        }
        log::info!("done get_post_list..: {:#?}", all_post);
        all_post.sort_unstable_by_key(|item| item.post.post_id);
        Ok(all_post)
    }

    pub async fn get_reply_count(&self, post_id: u32) -> Result<usize, crate::Error> {
        let reply_count = self
            .get_kids(post_id)
            .await?
            .map(|kids| kids.len())
            .unwrap_or(0);
        Ok(reply_count)
    }

    pub async fn get_post_details(&self, post_id: u32) -> Result<Option<PostDetail>, crate::Error> {
        log::info!("getting the post details of {}", post_id);
        let post = self.get_post(post_id).await?;
        if let Some(post) = post {
            let comment_replies = self.get_comment_replies(post_id).await?;
            let reply_count = self.get_reply_count(post_id).await?;
            Ok(Some(PostDetail {
                post,
                comments: comment_replies,
                reply_count,
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn get_post(&self, post_id: u32) -> Result<Option<Post>, crate::Error> {
        let args = json!({
            "url": self.url,
            "pallet": FORUM_MODULE,
            "storage": ALL_POSTS,
            "key": post_id.to_string(),
        });
        let args = JsValue::from_serde(&args).expect("must convert");
        let result = self.client.invoke_method("getStorageMap", args).await;
        let post: Option<Vec<u8>> = result.into_serde()?;
        if let Some(post) = post {
            let post: Option<Post> = Post::decode(&mut post.as_slice()).ok();
            Ok(post)
        } else {
            Ok(None)
        }
    }

    async fn get_kids(
        &self,
        item_id: u32,
    ) -> Result<Option<BoundedVec<u32, MaxComments>>, crate::Error> {
        let args = json!({
            "url": self.url,
            "pallet": FORUM_MODULE,
            "storage": KIDS,
            "key": item_id.to_string(),
        });
        let args = JsValue::from_serde(&args).expect("must convert");
        let result = self.client.invoke_method("getStorageMap", args).await;
        log::info!("result: {:#?}", result);
        let kids: Option<Vec<u8>> = result.into_serde()?;
        if let Some(kids) = kids {
            let kids: Option<BoundedVec<u32, MaxComments>> =
                Decode::decode(&mut kids.as_slice()).ok();
            Ok(kids)
        } else {
            Ok(None)
        }
    }

    #[async_recursion(?Send)]
    pub async fn get_comment_replies(
        &self,
        item_id: u32,
    ) -> Result<Vec<CommentDetail>, crate::Error> {
        let mut comment_details = vec![];
        if let Some(kids) = self.get_kids(item_id).await? {
            log::info!("kids of item_id: {} are: {:?}", item_id, kids);
            for kid in kids {
                log::info!("getting comment: {}", kid);
                let comment = self
                    .get_comment(kid)
                    .await?
                    .expect("must have a comment entry");

                let kid_comments = self.get_comment_replies(kid).await?;
                comment_details.push(CommentDetail {
                    comment,
                    kids: kid_comments,
                });
            }
        }
        comment_details.sort_unstable_by_key(|item| item.comment.comment_id);
        Ok(comment_details)
    }

    pub async fn get_comment(&self, comment_id: u32) -> Result<Option<Comment>, crate::Error> {
        let args = json!({
            "url": self.url,
            "pallet": FORUM_MODULE,
            "storage": ALL_COMMENTS,
            "key": comment_id.to_string(),
        });
        let args = JsValue::from_serde(&args).expect("must convert");
        let result = self.client.invoke_method("getStorageMap", args).await;
        log::info!("result: {:#?}", result);
        let comment: Option<Vec<u8>> = result.into_serde()?;
        if let Some(comment) = comment {
            let comment: Option<Comment> = Decode::decode(&mut comment.as_slice()).ok();
            Ok(comment)
        } else {
            Ok(None)
        }
    }
}
