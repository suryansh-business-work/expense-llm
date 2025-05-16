import ProfileForm from "./ProfileForm";
import ProfilePasswordForm from "./ProfilePasswordForm";

const Profile = () => {
  return (
    <div className="container" style={{ maxWidth: 800, marginTop: 48, marginBottom: 48 }}>
      <div className="card p-4">
        <ProfileForm />
        <ProfilePasswordForm />
      </div>
    </div>
  );
};

export default Profile;
