export const endPointFullUrl = (path: string): string => {
  const base = `${location.protocol}//${location.host}`;
  const startsWithSlash = path.startsWith('/');
  if (!startsWithSlash) path = '/' + path;
  return base + path;
};

export const getCSRFToken = (cookies: string): string => {
  const tokenPrefix = 'csrftoken=';
  const token = cookies.split(';').filter((c) => c.startsWith(tokenPrefix));
  if (token.length === 0) {
    throw new Error('Could not find CSRF token.');
  }

  return token[0].replace(tokenPrefix, '');
};
