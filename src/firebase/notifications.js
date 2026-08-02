import { ref, push } from "firebase/database";
import { rtdb } from "./config";

export const sendNotification = async ({
  toUid,
  fromUid,
  fromName,
  type,
  postId,
}) => {
  if (toUid === fromUid) return; // kendine bildirim gönderme

  const messages = {
    like: `${fromName} gönderini beğendi ❤️`,
    comment: `${fromName} gönderine yorum yaptı 💬`,
    follow: `${fromName} seni takip etmeye başladı 👥`,
  };

  await push(ref(rtdb, `notifications/${toUid}`), {
    type,
    fromUid,
    fromName,
    postId: postId || null,
    message: messages[type],
    read: false,
    createdAt: Date.now(),
  });
};
