export function handleExternalError(errorLogMessage: string) {
  return <E extends Error>(error: E) => {
    const errorId = Math.random().toString(36).substring(2, 9);
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message;

    console.error(
      `Error ${errorId} ${errorLogMessage}`,
      error.message || error
    );
    return {
      status: 500,
      message: {
        error: errorMessage,
        solution: `Try again later or contact support. (Error ID: ${errorId})`,
      },
    };
  };
}
