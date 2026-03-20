import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreatePatient } from '@/hooks/useApi';
import { Field, Spinner } from '@/components/ui';

const STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];

export default function NewPatientPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<any>({
    defaultValues: { patientType:'private', bloodGroup:'unknown', nationality:'Nigerian' }
  });
  const create = useCreatePatient();
  const patientType = watch('patientType');

  const onSubmit = async (data: any) => {
    const res: any = await create.mutateAsync(data);
    if (res?.data?.id) navigate(`/patients/${res.data.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Register New Patient</h1>
          <p className="text-sm text-slate-400">Fill in the patient's details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-5 pb-3 border-b border-slate-100">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="First Name" required error={errors.firstName?.message as string}>
              <input className="input" {...register('firstName', { required:'Required' })} placeholder="e.g. Chukwuemeka" />
            </Field>
            <Field label="Last Name" required error={errors.lastName?.message as string}>
              <input className="input" {...register('lastName', { required:'Required' })} placeholder="e.g. Okafor" />
            </Field>
            <Field label="Middle Name">
              <input className="input" {...register('middleName')} placeholder="Optional" />
            </Field>
            <Field label="Date of Birth" required error={errors.dateOfBirth?.message as string}>
              <input type="date" className="input" {...register('dateOfBirth', { required:'Required' })} />
            </Field>
            <Field label="Gender" required>
              <select className="input" {...register('gender', { required:'Required' })}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Blood Group">
              <select className="input" {...register('bloodGroup')}>
                <option value="unknown">Unknown</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Phone Number">
              <input className="input" {...register('phone')} placeholder="080XXXXXXXX" />
            </Field>
            <Field label="Alternate Phone">
              <input className="input" {...register('altPhone')} placeholder="Optional" />
            </Field>
            <Field label="Email">
              <input type="email" className="input" {...register('email')} placeholder="Optional" />
            </Field>
            <Field label="Marital Status">
              <select className="input" {...register('maritalStatus')}>
                <option value="">Select</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </Field>
            <Field label="Religion">
              <input className="input" {...register('religion')} placeholder="Optional" />
            </Field>
            <Field label="Occupation">
              <input className="input" {...register('occupation')} placeholder="Optional" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Field label="Address">
              <input className="input" {...register('address')} placeholder="Street address" />
            </Field>
            <Field label="State">
              <select className="input" {...register('state')}>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="LGA">
              <input className="input" {...register('lga')} placeholder="Local Government Area" />
            </Field>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-5 pb-3 border-b border-slate-100">Next of Kin</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name"><input className="input" {...register('nokName')} placeholder="Next of kin name" /></Field>
            <Field label="Phone"><input className="input" {...register('nokPhone')} placeholder="Next of kin phone" /></Field>
            <Field label="Relationship"><input className="input" {...register('nokRelationship')} placeholder="e.g. Spouse, Parent, Sibling" /></Field>
            <Field label="Address"><input className="input" {...register('nokAddress')} placeholder="Next of kin address" /></Field>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-5 pb-3 border-b border-slate-100">Insurance & Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Patient Type" required>
              <select className="input" {...register('patientType')}>
                <option value="private">Private (Self-Pay)</option>
                <option value="hmo">HMO</option>
                <option value="nhia">NHIA</option>
                <option value="staff">Staff</option>
                <option value="corporate">Corporate</option>
              </select>
            </Field>
            {(patientType === 'hmo' || patientType === 'nhia') && (<>
              <Field label="HMO/Insurance Name"><input className="input" {...register('hmoName')} placeholder="e.g. Hygeia HMO" /></Field>
              <Field label="Membership Number"><input className="input" {...register('hmoNumber')} placeholder="HMO membership no." /></Field>
              <Field label="Plan / Scheme"><input className="input" {...register('hmoPlan')} placeholder="e.g. Family Plan" /></Field>
              {patientType === 'nhia' && (
                <Field label="NHIA Number"><input className="input" {...register('nhiaNumber')} placeholder="NHIA number" /></Field>
              )}
            </>)}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-700 mb-5 pb-3 border-b border-slate-100">Clinical Flags</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Known Allergies" error={undefined}>
              <input className="input" {...register('knownAllergies')} placeholder="Separate with commas e.g. Penicillin, Sulpha" />
              <p className="text-xs text-slate-400 mt-1">Separate multiple allergies with commas</p>
            </Field>
            <Field label="Chronic Conditions">
              <input className="input" {...register('chronicConditions')} placeholder="e.g. Hypertension, Diabetes" />
            </Field>
            <Field label="Referral Source">
              <input className="input" {...register('referralSource')} placeholder="How did they hear about us?" />
            </Field>
            <Field label="Additional Notes">
              <textarea className="input" rows={2} {...register('notes')} placeholder="Any other notes..." />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-3 pb-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={create.isPending} className="btn-primary flex items-center gap-2 px-6">
            {create.isPending ? <Spinner size={16} /> : <Save size={16} />}
            {create.isPending ? 'Registering...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
