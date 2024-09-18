type ResponseDataType<T> = {
  success: boolean;
  message?: string | number | null;
  data?: T | null;
};

export const createResponse = <T>(
  success: boolean,
  message?: string | number | null,
  data?: T | null
): ResponseDataType<T> => {
  return { success, message: message ?? null, data: data ?? null };
};
