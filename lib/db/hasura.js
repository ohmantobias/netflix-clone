export async function insertStats(
  token,
  { favourited, watched, userId, videoId }
) {
  const operationsDoc = `
  
  mutation insertStats($favourited: Int!, $userId: String!, $videoId: String!, $watched: Boolean!) {
    insert_stats_one(object: {favourited: $favourited, userId: $userId, videoId: $videoId, watched: $watched}) {
      favourited
      userId
      videoId
      watched
      id
      
    }
  }
  
`;
  const response = await queryHasuraGQL(
    operationsDoc,
    "insertStats",
    { videoId, favourited, watched, userId },
    token
  );
  return response;
}

export async function updateStats(
  token,
  { favourited, watched, userId, videoId }
) {
  const operationsDoc = `
  mutation updateStats($favourited: Int!, $watched: Boolean!, $userId: String!, $videoId: String!) {
    update_stats(_set: {favourited: $favourited, watched: $watched}, where: {userId: {_eq: $userId}, videoId: {_eq: $videoId}}) {
      returning {
        favourited
        id
        userId
        videoId
        watched
      }
    }
  }
`;
  const response = await queryHasuraGQL(
    operationsDoc,
    "updateStats",
    { videoId, favourited, watched, userId },
    token
  );
  return response;
}

export async function findVideoIdByUser(userId, videoId, token) {
  const operationsDoc = `
  query findVideoIdByUserId($videoId: String!, $userId: String!) {
    stats(where: {userId: {_eq: $userId}, videoId: {_eq: $videoId}}) {
      id
      userId
      videoId
      watched
      favourited
    }
  }
`;

  const response = await queryHasuraGQL(
    operationsDoc,
    "findVideoIdByUserId",
    { userId, videoId },
    token
  );
  return response?.data?.stats;
}

export async function isNewUser(token, issuer) {
  const operationsDoc = `
  query isNewUser($issuer: String!) {
    users(where: {issuer: {_eq: $issuer}}) {
      id
      publicAddress
      issuer
      email
    }
  }
`;

  const response = await queryHasuraGQL(
    operationsDoc,
    "isNewUser",
    { issuer },
    token
  );
  return response?.data?.users?.length === 0;
}

export async function createNewUser(token, metaData) {
  const operationsDoc = `
  mutation createNewUser($issuer: String!, $email: String!, $publicAddress: String!) {
    insert_users(objects: {email: $email, issuer: $issuer, publicAddress: $publicAddress}) {
      returning {
        email
        id
        issuer
        publicAddress
      }
    }
  }
`;
  const { issuer, email, publicAddress } = metaData;
  const response = await queryHasuraGQL(
    operationsDoc,
    "createNewUser",
    { issuer, email, publicAddress },
    token
  );
  return response;
}

async function queryHasuraGQL(operationsDoc, operationName, variables, token) {
  const result = await fetch(process.env.NEXT_PUBLIC_HASURA_ADMIN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
      // "x-hasura-admin-secret": process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET,
    },
    body: JSON.stringify({
      query: operationsDoc,
      variables: variables,
      operationName: operationName,
    }),
  });

  return await result.json();
}

export async function getWatchedVideos(token, userId) {
  const operationsDoc = `
  query watchedVideos($userId: String!) {
    stats(where: {userId: {_eq: $userId}, watched: {_eq: true}}) {
      videoId
    }
  }
`;
  const response = await queryHasuraGQL(
    operationsDoc,
    "watchedVideos",
    { userId },
    token
  );
  return response.data.stats;
}

export async function myListVideos(token, userId) {
  const operationsDoc = `
  query favouritedVideos($userId: String!) {
    stats(where: {userId: {_eq: $userId}, favourited: {_eq: 1}}) {
      videoId
    }
  }
`;
  const response = await queryHasuraGQL(
    operationsDoc,
    "favouritedVideos",
    { userId },
    token
  );
  return response.data.stats;
}
