export default function AnnouncementBar() {
  return (
    <div
      className="announcement-bar"
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        zIndex: 5,
      }}
    >
      ✦ Season 01 drops are now live!{" "}
      <a href="/store">Shop Collection &rarr;</a>
    </div>
  );
}
