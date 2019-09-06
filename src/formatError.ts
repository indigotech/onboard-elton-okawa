import { ErrorPack } from "./ErrorPack";
import { DetailedError } from "./DetailedError";

export default function(error: { originalError: ErrorPack | Error }) {
  const formattedError = { ...error };
  
  if ('errors' in error.originalError) {
    formattedError['details'] = error.originalError.errors
      .map((detailedError: DetailedError) => detailedError.getMessageParameters());
  } else {
    const message = error.originalError.message;
    formattedError['details'] = [{ message }];
  }
  return formattedError;
}