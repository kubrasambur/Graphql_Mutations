const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const { users, posts, comments } = require("./data");
const { nanoid } = require("nanoid");

const typeDefs = gql`
  # User
  type User {
    id: ID!
    fullName: String!
    age: Int!
    posts: [Post!]!
    comments: [Comment!]!
  }

  input CreateUserInput {
    fullName: String!
    age: Int!
  }

  input UpdateUserInput {
    fullName: String
    age: Int
  }

  # Post
  type Post {
    id: ID!
    title: String!
    user_id: ID!
    user: User!
    comments: [Comment!]!
  }

  input CreatePostInput {
    title: String!
    user_id: ID!
  }

  input UpdatePostInput {
    title: String
    user_id: ID
  }

  # Comment
  type Comment {
    id: ID!
    text: String!
    post_id: ID!
    user: User!
    post: Post!
  }

  input CreateCommentInput {
    text: String!
    post_id: ID!
    user_id: ID!
  }

  input UpdateCommentInput {
    text: String
    post_id: ID
    user_id: ID
  }

  type DeleteAllOutput {
    count: Int!
  }

  type Query {
    # User
    users: [User!]!
    user(id: ID!): User!

    # Post
    posts: [Post!]!
    post(id: ID!): Post!

    # Comment
    comments: [Comment!]!
    comment(id: ID!): Comment!
  }

  type Mutation {
    # User
    createUser(data: CreateUserInput): User!
    # data = güncelenecek veriler
    updateUser(id: ID!, data: UpdateUserInput!): User!
    deleteUser(id: ID!): User!
    deleteAllUsers: DeleteAllOutput!

    # Post
    createPost(data: CreatePostInput): Post!
    updatePost(id: ID!, data: UpdatePostInput!): Post!
    deletePost(id: ID!): Post!
    deleteAllPosts:DeleteAllOutput!

    # Comment
    createComment(data: CreateCommentInput): Comment!
    updateComment(id: ID!, data: UpdateCommentInput!): Comment!
    deleteComment(id: ID!): Comment!
    deleteAllComments: DeleteAllOutput!
  }
`;

const resolvers = {
  Mutation: {
    // User
    createUser: (parent, { data }) => {
      const user = { id: nanoid(), ...data };
      users.push(user);
      return user;
    },
    updateUser: (parent, { id, data }) => {
      const user_index = users.findIndex((user) => user.id === id);
      if (user_index === -1) {
        throw new Error("User not found.");
      }
      //daha fazla field ın bulunduğu durumlarda aşağıdaki satırların yerine bir aşağıdaki kod bloğunu yazabiliriz
      /*
      users[user_index].fullName=data.fullName
      users[user_index].age=data.age
      */

      const updated_user = (users[user_index] = {
        ...users[user_index], //önceki veriler
        ...data, // data altındaki güncellenenn veriler
      });

      return updated_user;
    },
    deleteUser: (parent, { id }) => {
      const user_index = users.findIndex((user) => user.id === id);
      if (user_index === -1) {
        throw new Error("User not found");
      }
      const deleted_user = users[user_index];
      users.splice(user_index, 1);
      return deleted_user;
    },
    deleteAllUsers: (parent, args) => {
      const length = users.length;
      users.splice(0,length)
      return {
        count: length,
      };
    },

    // Post
    createPost: (parent, { data }) => {
      const post = { id: nanoid(), ...data };
      posts.push(post);
      return post;
    },
    updatePost: (parent, { id, data }) => {
      const post_index = posts.findIndex((post) => post.id === id);
      if (post_index === -1) {
        throw new Error("Post not found.");
      }

      const updated_post = (posts[post_index] = {
        ...posts[post_index],
        ...data,
      });
      return updated_post;
    },
    deletePost: (parent, { id }) => {
      const post_index = posts.findIndex((post) => post.id === id);
      if (post_index === -1) {
        throw new Error("Post not found");
      }
      const deleted_post = posts[post_index];
      posts.splice(post_index, 1);
      return deleted_post;
    },
    deleteAllPosts:(parent,args)=>{
      const length = posts.length
      posts.splice(0,length)
      return {
        count:length
      }
    },

    //Comment
    /*
      aşağıdaki gibi her field için tek tek data.field yazmak yerine hepsi için spread operatörü ile ...data yazarak datanın içindkei bütün alanları alabiliriz.

      createComment: (parent, { data }) => {
      const comment = {
        id: nanoid(),
        text: data.text,
        post_id: data.post_id,
        user_id: data.user_id,
      };
    },
    */
    createComment: (parent, { data }) => {
      const comment = {
        id: nanoid(),
        ...data,
      };
      comments.push(comment);
      return comment;
    },
    updateComment: (parent, { id, data }) => {
      const comment_index = comments.findIndex((comment) => comment.id === id);
      if (comment_index === -1) {
        throw new Error("Comment not found");
      }

      const updated_comment = (comments[comment_index] = {
        ...comments[comment_index],
        ...data,
      });
      return updated_comment;
    },
    deleteComment: (parent, { id }) => {
      const comment_index = comments.findIndex((comment) => comment.id === id);
      if (comment_index === -1) {
        throw new Error("Comment not found");
      }
      const deleted_comment = comments[comment_index];
      comments.splice(comment_index, 1);
      return deleted_comment;
    },
    deleteAllComments:(parent,args)=>{
      const length = comments.length
      comments.splice(0,length)
      return{
        count:length
      }
    }
  },
  Query: {
    // User
    users: () => users,
    user: (parent, args) => {
      const user = users.find((user) => user.id === args.id);
      if (!user) {
        return new Error("User not found");
      }
      return user;
    },

    // Post
    posts: () => posts,
    post: (parent, args) => {
      const post = posts.find((post) => post.id === args.id);
      if (!post) {
        return new Error("Post not found");
      }
      return post;
    },

    // Comment
    comments: () => comments,
    comment: (parent, args) => {
      const comment = comments.find((comment) => comment.id === args.id);
      if (!comment) {
        return new Error("Comment not found");
      }
      return comment;
    },
  },
  User: {
    posts: (parent, args) => posts.filter((post) => post.user_id === parent.id),
    comments: (parent, args) =>
      comments.filter((comment) => comment.user_id === parent.id),
  },
  Post: {
    user: (parent, args) => users.find((user) => user.id === parent.user_id),
    comments: (parent, args) =>
      comments.filter((comment) => comment.post_id === parent.id),
  },
  Comment: {
    user: (parent, args) => users.find((user) => user.id === parent.user_id),
    post: (parent, args) => posts.find((post) => post.id === parent.post_id),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});
server.listen().then(({ url }) => console.log(`Apollo server is up at ${url}`));
