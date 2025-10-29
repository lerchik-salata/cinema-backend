export interface Post {
  id: number;
  threadId: number;
  authorId: string;
  content: string;
  parentPostId: number | null;
  createdAt: Date;
}
