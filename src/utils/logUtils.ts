import { IPost } from '../interfaces/post'


export const extractUniqueTags = (posts: IPost[]) => {
  posts.forEach((post) => {
    console.log(post.data.tags)
    // post.data.tags.forEach(tag => {
      
    // })
  })
}
