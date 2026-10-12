export const getAllService = async (query) => {
  return [];
};

export const getByIdService = async (id) => {
  return { id };
};

export const createService = async (data) => {
  return data;
};

export const updateService = async (id, data) => {
  return { id, ...data };
};

export const removeService = async (id) => {
  return true;
};
