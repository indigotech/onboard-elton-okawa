export const requestGraphQLWithToken = (request, query: string, token: string): Promise<any> => {
  return request.post('/').send({ query }).set('Authorization', token);
};

export const requestGraphQL = (request, query: string): Promise<any> => {
  return request.post('/').send({ query });
};