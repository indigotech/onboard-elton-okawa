import { ErrorPack } from "./ErrorPack";
import { DetailedError } from "./DetailedError";

export default function(error: { originalError?: ErrorPack | Error , message: string }) {
  const formattedError = { ...error };

  if (error.originalError && 'errors' in error.originalError) {
    formattedError['details'] = error.originalError.errors
      .map((detailedError: DetailedError) => detailedError.getMessageParameters());
  } else {
    const message = (error.originalError && error.originalError.message) || error.message;
    formattedError['details'] = [{ message }];
  }
  
  return formattedError;
}