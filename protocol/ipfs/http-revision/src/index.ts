import {
  Client,
  Module,
  Args_get,
  Args_post,
  Http_Response,
  manifest,
} from "./wrap";
import { toFormData, fromAxiosResponse, toAxiosRequestConfig } from "./util";

import axios, { AxiosResponse } from "axios";
import { PluginFactory } from "@polywrap/core-js";

type NoConfig = Record<string, never>;

export class HttpPlugin extends Module<NoConfig> {
  public async get(
    args: Args_get,
    _client: Client
  ): Promise<Http_Response | null> {
    const response = await axios.get<string>(
      args.url,
      args.request ? toAxiosRequestConfig(args.request) : undefined
    );
    return fromAxiosResponse(response);
  }

  public async post(
    args: Args_post,
    _client: Client
  ): Promise<Http_Response | null> {
    let response: AxiosResponse;
    if (args.request?.body) {
      response = await axios.post(
        args.url,
        args.request.body,
        toAxiosRequestConfig(args.request)
      );
    } else if (args.request?.data) {
      const config = toAxiosRequestConfig(args.request);
      config.headers = {
        ...config.headers,
        'Content-Type': "multipart/form-data"
      };
      response = await axios.post(
        args.url,
        toFormData(args.request.data),
        config
      );
    } else if (args.request) {
      response = await axios.post(args.url, toAxiosRequestConfig(args.request));
    } else {
      response = await axios.post(args.url);
    }
    return fromAxiosResponse(response);
  }
}

export const httpPlugin: PluginFactory<NoConfig> = () => {
  return {
    factory: () => new HttpPlugin({}),
    manifest,
  };
};

export const plugin = httpPlugin;
