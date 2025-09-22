import { CommentCreateArgType, DependencyType } from '../helpers/types.ts';
export declare function createCommentWith(deps: DependencyType): (args: CommentCreateArgType) => Promise<string>;
export declare function getCommentsWith(deps: DependencyType): (args: {
    commentsId: string;
}) => Promise<any>;
export declare function updateCommentStatusWith(deps: DependencyType): (args: {
    commentsId: string;
    commentId: string;
    status: "active" | "inactive";
}) => Promise<string>;
export declare function removeCommentWith(deps: DependencyType): (args: {
    commentsId: string;
    commentId: string;
    status: "active" | "inactive";
}) => Promise<string>;
