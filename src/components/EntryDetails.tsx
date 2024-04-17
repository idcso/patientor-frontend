import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WorkIcon from '@mui/icons-material/Work';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {
  Entry,
  HealthCheckEntry,
  HospitalEntry,
  OccupationalHealthcareEntry,
  HealthCheckRating,
} from '../types';
import { Healing } from '@mui/icons-material';

const entryStyles = {
  border: '1px solid black',
  borderRadius: 5,
  marginBottom: 10,
  padding: '0px 12px',
};

const HealthCheck = ({ entry }: { entry: HealthCheckEntry }) => {
  const healthCheckRatingIcon = (rating: HealthCheckRating) => {
    switch (rating) {
      case 0:
        return '💚';
      case 1:
        return '💛';
      case 2:
        return '❤️';
      case 3:
        return '🖤';
    }
  };

  return (
    <div style={entryStyles}>
      <p>
        {entry.date} <MedicalServicesIcon />
      </p>
      <p style={{ fontStyle: 'italic' }}>
        {entry.description} <br />{' '}
        {healthCheckRatingIcon(entry.healthCheckRating)}
      </p>
      <p>diagnose by {entry.specialist}</p>
    </div>
  );
};

const OccupationalHealthcare = ({
  entry,
}: {
  entry: OccupationalHealthcareEntry;
}) => {
  return (
    <div style={entryStyles}>
      <p>
        {entry.date} <WorkIcon />{' '}
        <span style={{ fontStyle: 'italic' }}>{entry.employerName}</span>
      </p>
      <p style={{ fontStyle: 'italic' }}>{entry.description}</p>
      <p>diagnose by {entry.specialist}</p>
    </div>
  );
};

const Hospital = ({ entry }: { entry: HospitalEntry }) => {
  return (
    <div style={entryStyles}>
      <p>
        {entry.date} <LocalHospitalIcon />{' '}
      </p>
      <p style={{ fontStyle: 'italic' }}>{entry.description}</p>
      <p>
        <Healing /> {entry.discharge.date} - {entry.discharge.criteria}
      </p>
      <p>diagnose by {entry.specialist}</p>
    </div>
  );
};

const EntryDetails = ({ entry }: { entry: Entry }) => {
  const assertNever = (value: never): never => {
    throw new Error(
      `Unhandled discriminated union member: ${JSON.stringify(value)}`
    );
  };

  switch (entry.type) {
    case 'HealthCheck':
      return <HealthCheck entry={entry} />;
    case 'OccupationalHealthcare':
      return <OccupationalHealthcare entry={entry} />;
    case 'Hospital':
      return <Hospital entry={entry} />;
    default:
      return assertNever(entry);
  }
};

export default EntryDetails;
