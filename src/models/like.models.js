import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },

    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },

    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

likeSchema.index({ video: 1, likedBy: 1 });
likeSchema.index({ comment: 1, likedBy: 1 });
likeSchema.index({ tweet: 1, likedBy: 1 });

export const Like = mongoose.model("Like", likeSchema);
