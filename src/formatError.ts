export default function(error) {
  return { ...error, detailedMessage: error.originalError && error.originalError.detailedMessage };
}