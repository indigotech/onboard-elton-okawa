import { ErrorPack } from "./ErrorPack";
import { DetailedError } from "./DetailedError";

export default function(error: { originalError: ErrorPack | DetailedError | Error}) {
  const formattedError = { ...error };
  if (error.originalError) {

    if('errors' in error.originalError) {
      formattedError['details'] = error.originalError.errors
        .map((detailedError: DetailedError) => detailedError.getMessageParameters());
    } else if('detailedMessage' in error.originalError) {
      formattedError['detailedMessage'] = error.originalError.detailedMessage;
    }
  }
  return formattedError;
}