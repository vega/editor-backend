/**
 * Stores the pagination size of displaying gists.
 *
 * _Exported as `paginationSize`_.
 */
export const paginationSize = 8;

/**
 * Interface for defining structure of a received POST request
 */
export interface ICreateGist {
  content: string;
  name: string;
  privacy: boolean;
  title?: string;
}

/**
 * Interface for defining the structure of the the requested Gist
 */
export interface IGetGist {
  user: {
    gists: {
      nodes: {
        name: string;
        description: string;
        files: {
          name: string;
          extension: string;
          isImage: boolean;
        };
        isPublic: boolean;
      };
      edges?: {
        cursor: string;
        node: {
          files: {
            extension: string;
          }[];
        };
      }[];
    };
  };
}
