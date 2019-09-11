export const requestGraphQLWithToken = (request, body: {}, token: string): Promise<any> => {
  return request.post('/').send(body).set('Authorization', token);
};

export const requestGraphQL = (request, body: {}): Promise<any> => {
  return request.post('/').send(body);
};