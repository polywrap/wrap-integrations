import { Request, Response } from "./wrap";
import { AxiosResponse, AxiosRequestConfig } from "axios";
/**
 * Convert AxiosResponse<string> to Response
 *
 * @param axiosResponse
 */
export declare function fromAxiosResponse(axiosResponse: AxiosResponse<unknown>): Response;
/**
 * Creates AxiosRequestConfig from Request
 *
 * @param request
 */
export declare function toAxiosRequestConfig(request: Request): AxiosRequestConfig;
