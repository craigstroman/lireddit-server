import { Resolver, Query, Arg, Int, Mutation } from 'type-graphql';
import { Post } from '../entities/POST';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  async createPost(@Arg('title') title: string): Promise<Post> {
    const post = Post.create({ title }).save();
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);

    if (!post) {
      return null;
    }

    if (typeof title !== 'undefined') {
      post.title = title;

      Post.update({ id }, { title });
    }

    return post;
  }

  @Mutation(() => Boolean)
  async deletePostById(@Arg('id') id: number): Promise<boolean> {
    try {
      await Post.delete(id);

      return true;
    } catch (error) {
      console.log('error: ', error);
      return false;
    }
  }
}
