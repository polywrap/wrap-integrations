use std::slice::Iter;
use crate::wrap::{IpfsOptions, Env };

pub struct Options<'t> {
    pub disable_parallel_requests: bool,
    pub timeout: u32,
    pub providers: Vec<&'t str>,
}

pub fn get_options<'t>(args: &'t Option<IpfsOptions>, env: &'t Env) -> Options<'t> {
    let disable_parallel_requests: bool;
    let timeout: u32;
    let mut providers: Vec<&'t str> = Vec::new();

    // options exist?
    if let Some(some_args) = args {

        // disable parallel requests
        if let Some(args_value) = some_args.disable_parallel_requests {
            disable_parallel_requests = args_value;
        } else if let Some(env_value) = env.disable_parallel_requests {
            disable_parallel_requests = env_value;
        } else {
            disable_parallel_requests = false;
        }

        // timeout
        if let Some(args_value) = some_args.timeout {
            timeout = args_value;
        } else if let Some(env_value) = env.timeout {
            timeout = env_value;
        } else {
            timeout = 5000;
        }

        // default provider is options.provider or env.provider
        match &some_args.provider {
            Some(provider) => providers.push(provider.as_ref()),
            None => providers.push(env.provider.as_ref()),
        }

        // options.fallback_providers follow default
        if let Some(fallback_providers) = &some_args.fallback_providers {
            fallback_providers.iter()
                .map(|s| s.as_ref())
                .for_each(|p| providers.push(p));
        }

    // no options
    } else {
        disable_parallel_requests = match env.disable_parallel_requests {
            Some(env_value) => env_value,
            None => false
        };

        timeout = match env.timeout {
            Some(env_value) => env_value,
            None => 5000
        };
    }

    // if we added options.provider, we still need to add env.provider
    if !providers.contains(&env.provider.as_ref()) {
        providers.push(env.provider.as_ref());
    }

    // env.fallback_providers are added last
    if let Some(fallback_providers) = &env.fallback_providers {
        fallback_providers.iter()
            .map(|s| s.as_ref())
            .filter(|p| !providers.contains(p))
            .collect::<Vec<&str>>()
            .iter()
            .for_each(|p| providers.push(p));
    }

    Options {
        disable_parallel_requests,
        timeout,
        providers,
    }
}
