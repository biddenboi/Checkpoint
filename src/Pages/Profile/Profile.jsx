import { useLocation, useNavigate } from "react-router-dom";

function Profile() {
//read through this code again when ur not tired
  const { state } = useLocation();
  const navigate = useNavigate();
  const player = state?.player;

  if (!player) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="profile">
      <p>{player.username}</p>
      <p>{player.points}</p>
      {/* access anything else from player */}
    </div>
  );
}

export default Profile;
