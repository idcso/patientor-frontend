import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Diagnosis, Entry, Patient } from '../../types';
import patientService from '../../services/patients';
import diagnosesService from '../../services/diagnoses';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import TransgenderIcon from '@mui/icons-material/Transgender';
import EntryDetails from '../EntryDetails';
import AddEntryForm from './AddEntryForm';

const PatientPage = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchPatient = async (id: string) => {
      const currentPatient = await patientService.getById(id);
      setPatient(currentPatient);
    };

    const fetchDiagnoses = async () => {
      const data = await diagnosesService.getAll();
      setDiagnoses(data);
    };

    if (id) void fetchPatient(id);
    void fetchDiagnoses();
  }, [id]);

  if (!patient) return null;

  const addPatientEntry = (entry: Entry) => {
    setPatient({
      ...patient,
      entries: patient.entries.concat(entry),
    });
  };

  return (
    <div>
      <h2>
        {patient.name}{' '}
        {patient.gender === 'male' ? (
          <MaleIcon />
        ) : patient.gender === 'female' ? (
          <FemaleIcon />
        ) : (
          <TransgenderIcon />
        )}
      </h2>
      <div>
        ssh: {patient.ssn} <br />
        occupation: {patient.occupation}
      </div>
      <AddEntryForm id={patient.id} addPatientEntry={addPatientEntry} />
      <h3>entries</h3>
      {patient.entries.map((entry) => (
        <EntryDetails key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

export default PatientPage;
