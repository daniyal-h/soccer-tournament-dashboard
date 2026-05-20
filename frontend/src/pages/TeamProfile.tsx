import { useParams } from 'react-router-dom';

const TeamProfile = () => {
  const { teamId } = useParams();

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Team: {teamId}</h1>

      <p className="text-muted-foreground">Profile for team: {teamId}</p>
    </section>
  );
};

export default TeamProfile;
