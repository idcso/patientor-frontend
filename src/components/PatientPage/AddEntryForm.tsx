type EntryType = 'healthCheck' | 'occupationalHealthcare' | 'hospital';
interface EntryButtonType {
  healthCheck: 'contained' | 'outlined';
  occupational: 'contained' | 'outlined';
  hospital: 'contained' | 'outlined';
}

import {
  Alert,
  AlertColor,
  Button,
  TextField,
  FormControl,
  FormGroup,
  FormLabel,
  InputLabel,
  Select,
  Input,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';
import patientsService from '../../services/patients';
import {
  Entry,
  Diagnosis,
  EntryWithoutId,
  NewBaseEntry,
  SickLeave,
  Discharge,
} from '../../types';
import axios from 'axios';

const codes = [
  'M24.2',
  'M51.2',
  'S03.5',
  'J10.1',
  'J06.9',
  'Z57.1',
  'N30.0',
  'H54.7',
  'J03.0',
  'L60.1',
  'Z74.3',
  'L20',
  'F43.2',
  'S62.5',
  'H35.29',
];
const HealthCheckRating = [0, 1, 2, 3];

const AddEntryForm = ({
  id,
  addPatientEntry,
}: {
  id: string;
  addPatientEntry: (entry: Entry) => void;
}) => {
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [diagnosisCodes, setDiagnosisCodes] = useState<
    Array<Diagnosis['code']>
  >([]);
  const [healthCheckRating, setHealthCheckRating] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [sickLeave, setSickLeave] = useState<SickLeave>({
    startDate: '',
    endDate: '',
  });
  const [discharge, setDischarge] = useState<Discharge>({
    date: '',
    criteria: '',
  });
  const [entryType, setEntryType] = useState<EntryType>('healthCheck');
  const [notification, setNotification] = useState('');
  const [alertStatus, setAlertStatus] = useState<AlertColor>('success');
  const [variant, setVariant] = useState<EntryButtonType>({
    healthCheck: 'contained',
    occupational: 'outlined',
    hospital: 'outlined',
  });

  const handleEntryButtonClick = (value: EntryType) => {
    setEntryType(value);

    switch (value) {
      case 'healthCheck':
        setVariant({
          healthCheck: 'contained',
          occupational: 'outlined',
          hospital: 'outlined',
        });
        break;
      case 'occupationalHealthcare':
        setVariant({
          healthCheck: 'outlined',
          occupational: 'contained',
          hospital: 'outlined',
        });
        break;
      case 'hospital':
        setVariant({
          healthCheck: 'outlined',
          occupational: 'outlined',
          hospital: 'contained',
        });
        break;
    }
  };

  const showRelatedInputs = (type: EntryType) => {
    switch (type) {
      case 'healthCheck':
        return (
          <FormControl fullWidth variant="standard">
            <InputLabel>Healthcheck rating</InputLabel>
            <Select
              value={healthCheckRating}
              onChange={(e) => setHealthCheckRating(e.target.value)}
              input={<Input required />}
            >
              {HealthCheckRating.map((rating) => (
                <MenuItem key={rating} value={rating}>
                  {rating}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'occupationalHealthcare':
        return (
          <>
            <TextField
              label="Employer name"
              variant="standard"
              required
              fullWidth
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
            />
            <FormLabel style={{ display: 'block', margin: '20px 0px 8px' }}>
              Sickleave
            </FormLabel>
            <FormGroup>
              <FormControl fullWidth variant="standard">
                <InputLabel shrink>start</InputLabel>
                <Input
                  type="date"
                  required
                  value={sickLeave.startDate}
                  onChange={(e) =>
                    setSickLeave({ ...sickLeave, startDate: e.target.value })
                  }
                />
              </FormControl>
              <FormControl fullWidth variant="standard">
                <InputLabel shrink>end</InputLabel>
                <Input
                  type="date"
                  required
                  value={sickLeave.endDate}
                  onChange={(e) =>
                    setSickLeave({ ...sickLeave, endDate: e.target.value })
                  }
                />
              </FormControl>
            </FormGroup>
          </>
        );
      case 'hospital':
        return (
          <>
            <FormLabel style={{ display: 'block', margin: '20px 0px 8px' }}>
              Discharge
            </FormLabel>
            <FormGroup>
              <FormControl fullWidth variant="standard">
                <InputLabel shrink>date</InputLabel>
                <Input
                  type="date"
                  required
                  value={discharge.date}
                  onChange={(e) =>
                    setDischarge({ ...discharge, date: e.target.value })
                  }
                />
              </FormControl>
              <FormControl fullWidth variant="standard">
                <InputLabel>criteria</InputLabel>
                <Input
                  required
                  value={discharge.criteria}
                  onChange={(e) =>
                    setDischarge({ ...discharge, criteria: e.target.value })
                  }
                />
              </FormControl>
            </FormGroup>
          </>
        );
    }
  };

  const clearInputs = (entryType: EntryType) => {
    setDescription('');
    setDate('');
    setSpecialist('');
    setDiagnosisCodes([]);

    switch (entryType) {
      case 'healthCheck':
        setHealthCheckRating('');
        break;
      case 'occupationalHealthcare':
        setEmployerName('');
        setSickLeave({ startDate: '', endDate: '' });
        break;
      case 'hospital':
        setDischarge({ date: '', criteria: '' });
        break;
    }
  };

  const newEntryConstructor = (
    baseEntry: NewBaseEntry,
    entryType: EntryType
  ): EntryWithoutId => {
    switch (entryType) {
      case 'healthCheck':
        const healthCheckEntry: EntryWithoutId = {
          ...baseEntry,
          type: 'HealthCheck',
          healthCheckRating: Number(healthCheckRating),
        };
        return healthCheckEntry;
      case 'occupationalHealthcare':
        const occupationalHealthcareEntry: EntryWithoutId = {
          ...baseEntry,
          type: 'OccupationalHealthcare',
          employerName: employerName,
        };
        if (sickLeave) {
          occupationalHealthcareEntry.sickLeave = sickLeave;
        }
        return occupationalHealthcareEntry;
      case 'hospital':
        const hospitalEntry: EntryWithoutId = {
          ...baseEntry,
          type: 'Hospital',
          discharge: discharge,
        };
        return hospitalEntry;
    }
  };

  const handleForm = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    const baseEntry: NewBaseEntry = { description, date, specialist };
    if (diagnosisCodes) {
      baseEntry.diagnosisCodes = diagnosisCodes;
    }

    try {
      const addedEntry = await patientsService.createEntry(
        id,
        newEntryConstructor(baseEntry, entryType)
      );
      addPatientEntry(addedEntry);
      setNotification('New entry is successfully created!');
      setAlertStatus('success');
      setTimeout(() => setNotification(''), 4000);
      clearInputs(entryType);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setNotification(error.response?.data);
        setAlertStatus('error');
        setTimeout(() => setNotification(''), 4000);
      }
    }
  };

  const handleSelect = (event: SelectChangeEvent<typeof diagnosisCodes>) => {
    const value = event.target.value;
    setDiagnosisCodes(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <>
      <div>
        {notification ? (
          <Alert severity={alertStatus}>{notification}</Alert>
        ) : (
          ''
        )}
      </div>
      <form
        style={{
          border: '2px dotted black',
          padding: 12,
          marginTop: 12,
        }}
        onSubmit={handleForm}
      >
        <h3 style={{ margin: 0 }}>New entry</h3>
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 8,
          }}
        >
          <Button
            variant={variant.healthCheck}
            color="primary"
            size="small"
            style={{ textTransform: 'none' }}
            onClick={() => handleEntryButtonClick('healthCheck')}
          >
            HealthCheck
          </Button>
          <Button
            variant={variant.occupational}
            color="primary"
            size="small"
            style={{ textTransform: 'none' }}
            onClick={() => handleEntryButtonClick('occupationalHealthcare')}
          >
            OccupationalHealthcare
          </Button>
          <Button
            variant={variant.hospital}
            color="primary"
            size="small"
            style={{ textTransform: 'none' }}
            onClick={() => handleEntryButtonClick('hospital')}
          >
            Hospital
          </Button>
        </div>
        <TextField
          label="Description"
          variant="standard"
          required
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <FormControl fullWidth variant="standard">
          <InputLabel shrink>Date</InputLabel>
          <Input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormControl>
        <TextField
          label="Specialist"
          variant="standard"
          required
          fullWidth
          value={specialist}
          onChange={(e) => setSpecialist(e.target.value)}
        />
        <FormControl fullWidth variant="standard">
          <InputLabel>Diagnosis codes</InputLabel>
          <Select
            multiple
            value={diagnosisCodes}
            onChange={handleSelect}
            input={<Input />}
          >
            {codes.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {showRelatedInputs(entryType)}
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => clearInputs(entryType)}
          >
            Cancel
          </Button>
          <Button variant="contained" color="success" type="submit">
            Add
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddEntryForm;
