import type { ApiResponse } from "apisauce";

export interface ApiErrorPayload {
  message: string;
  code?: string;
}

export type ApiResult<TData> = ApiResponse<TData, ApiErrorPayload>;
