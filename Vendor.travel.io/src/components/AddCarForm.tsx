import React, { useState, ChangeEvent, FormEvent } from 'react';

type CarDetailsForm1 = {
  rcNumber: string;
  ownerName: string;
  brandName: string;
  makerName: string;
  vehicleClass: string;
  fuelType: string;
  chassisNumber: string;
  engineNumber: string;
  registrationDate: string;
  fitnessExpiry: string;
  insuranceExpiry: string;
};

type CarDetailsForm2 = {
  rcImage: File | null;
  carImage: File | null;
  insuranceDoc: File | null;
  fitnessDoc: File | null;
  permitDoc: File | null;
  brandName: string;
  fuelType: string;
  makeYear: string;
  insurerName: string;
  policyNumber: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  permitExpiry: string;
  permitType: string;
  luggageCarrier: string;
  sourcing: string;
};

// Dummy options - simulate future API data
const brandOptions = ['Toyota', 'Hyundai', 'Tata', 'Mahindra'];
const fuelOptions = ['Petrol', 'Diesel', 'Electric', 'CNG'];
const vehicleClasses = ['SUV', 'Sedan', 'Hatchback', 'Pickup'];
const permitTypes = ['Private', 'Commercial', 'Contract Carriage'];
const sourcingOptions = ['Owned', 'Leased', 'Rented'];

const AddCarForm: React.FC = () => {
  const [step, setStep] = useState<number>(2);

  const [form1, setForm1] = useState<CarDetailsForm1>({
    rcNumber: '',
    ownerName: '',
    brandName: '',
    makerName: '',
    vehicleClass: '',
    fuelType: '',
    chassisNumber: '',
    engineNumber: '',
    registrationDate: '',
    fitnessExpiry: '',
    insuranceExpiry: '',
  });

  const [form2, setForm2] = useState<CarDetailsForm2>({
    rcImage: null,
    carImage: null,
    insuranceDoc: null,
    fitnessDoc: null,
    permitDoc: null,
    brandName: '',
    fuelType: '',
    makeYear: '',
    insurerName: '',
    policyNumber: '',
    insuranceExpiry: '',
    fitnessExpiry: '',
    permitExpiry: '',
    permitType: '',
    luggageCarrier: '',
    sourcing: '',
  });

  const handleChange1 = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm1(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChange2 = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files.length > 0) {
      setForm2(prev => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setForm2(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = () => {
    console.log('Form1:', form1);
    console.log('Form2:', {
      ...form2,
      rcImage: form2.rcImage?.name,
      carImage: form2.carImage?.name,
      insuranceDoc: form2.insuranceDoc?.name,
      fitnessDoc: form2.fitnessDoc?.name,
      permitDoc: form2.permitDoc?.name,
    });

    alert('Car data submitted successfully!');
    setStep(1);
    setForm1({
      rcNumber: '',
      ownerName: '',
      brandName: '',
      makerName: '',
      vehicleClass: '',
      fuelType: '',
      chassisNumber: '',
      engineNumber: '',
      registrationDate: '',
      fitnessExpiry: '',
      insuranceExpiry: '',
    });
    setForm2({
      rcImage: null,
      carImage: null,
      insuranceDoc: null,
      fitnessDoc: null,
      permitDoc: null,
      brandName: '',
      fuelType: '',
      makeYear: '',
      insurerName: '',
      policyNumber: '',
      insuranceExpiry: '',
      fitnessExpiry: '',
      permitExpiry: '',
      permitType: '',
      luggageCarrier: '',
      sourcing: '',
    });
  };

  const renderFormInputs1 = () => (
    <>
      {Object.entries(form1).map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1');
        const inputType = key.toLowerCase().includes('date') || key.toLowerCase().includes('expiry')
          ? 'date'
          : 'text';

        if (key === 'brandName') {
          return renderSelect(key, label, value, brandOptions, handleChange1);
        }

        if (key === 'fuelType') {
          return renderSelect(key, label, value, fuelOptions, handleChange1);
        }

        if (key === 'vehicleClass') {
          return renderSelect(key, label, value, vehicleClasses, handleChange1);
        }

        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="capitalize text-sm font-medium">{label}:</label>
            <input
              type={inputType}
              name={key}
              value={value}
              onChange={handleChange1}
              className="px-3 py-2 rounded-md text-black"
              required
            />
          </div>
        );
      })}
    </>
  );

  const renderFormInputs2 = () => (
    <>
      {Object.entries(form2).map(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1');

        if (key.includes('Image') || key.includes('Doc')) {
          return (
            <div key={key} className="flex flex-col gap-1">
              <label className="capitalize text-sm font-medium">{label}:</label>
              <input
                type="file"
                name={key}
                accept="image/*,.pdf"
                onChange={handleChange2}
                className="px-3 py-2 rounded-md text-black bg-white"
              />
            </div>
          );
        }

        if (key === 'brandName') {
          return renderSelect(key, label, value as string, brandOptions, handleChange2);
        }

        if (key === 'fuelType') {
          return renderSelect(key, label, value as string, fuelOptions, handleChange2);
        }

        if (key === 'permitType') {
          return renderSelect(key, label, value as string, permitTypes, handleChange2);
        }

        if (key === 'sourcing') {
          return renderSelect(key, label, value as string, sourcingOptions, handleChange2);
        }

        const inputType = key.toLowerCase().includes('date') || key.toLowerCase().includes('expiry')
          ? 'date'
          : 'text';

        return (
          <div key={key} className="flex flex-col gap-1">
            <label className="capitalize text-sm font-medium">{label}:</label>
            <input
              type={inputType}
              name={key}
              value={value as string}
              onChange={handleChange2}
              className="px-3 py-2 rounded-md text-black"
              required
            />
          </div>
        );
      })}
    </>
  );

  const renderSelect = (
    name: string,
    label: string,
    value: string,
    options: string[],
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  ) => (
    <div key={name} className="flex flex-col gap-1">
      <label className="capitalize text-sm font-medium">{label}:</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="px-3 py-2 rounded-md text-black"
        required
      >
        <option value="">Select {label}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if(step==1){
        handleNext();
    }
    else{
        handleSubmit();
    }
   
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-blue-900 text-white p-6 rounded-2xl">
      <h2 className="text-lg text-center mb-6 font-semibold">
        Make Sure All The Cars Are in Good Condition & Well Maintained
      </h2>

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {step === 1 ? renderFormInputs1() : renderFormInputs2()}

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="bg-lime-400 px-8 py-2 text-black rounded-md font-semibold hover:bg-lime-300 transition"
          >
            {step === 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCarForm;
