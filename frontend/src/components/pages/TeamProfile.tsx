import { useParams } from "react-router-dom"

const TeamProfile = () => {
  const { teamId } = useParams();

  return (
    <div>TeamProfile for team: {teamId}</div>
  )
}

export default TeamProfile