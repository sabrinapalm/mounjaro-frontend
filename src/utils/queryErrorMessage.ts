export const getQueryErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof Error) {
    if (error.message === 'Unknown error from devtools') {
      return fallbackMessage;
    }

    return error.message;
  }

  return fallbackMessage;
};
