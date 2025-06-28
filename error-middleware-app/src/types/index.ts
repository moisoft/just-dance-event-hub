export interface CustomError extends Error {
    statusCode?: number;
    message: string;
}

export interface RequestWithError extends Request {
    error?: CustomError;
}

export interface ResponseWithError extends Response {
    customSend: (statusCode: number, message: string) => void;
}