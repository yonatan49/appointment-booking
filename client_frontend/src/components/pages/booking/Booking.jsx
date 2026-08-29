import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../ui/navbar/Navbar';
import Footer from '../../ui/footer/Footer';
import './Booking.css';
import * as Icons from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../../lib/api';

const steps = ['Select Service', 'Choose Artist', 'Choose Date & Time', 'Your Details'];

const Booking = () => {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersError, setWorkersError] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [modal, setModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info',
    closeLabel: 'Close',
    onClose: null,
    dismissible: false,
    showEditIcon: false,
  });

  const timeSlots = useMemo(() => ([
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  ]), []);

  const formatDuration = (minutes) => {
    if (typeof minutes !== 'number' || Number.isNaN(minutes)) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${mins} min`;
  };

  useEffect(() => {
    const controller = new AbortController();
    setServicesLoading(true);
    setServicesError('');
    api.get('/api/services', { signal: controller.signal })
      .then(({ data }) => setServices(data))
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Error fetching services:', err);
          const message = err?.response?.data?.error || err?.message || 'Failed to load services';
          setServicesError(message);
        }
      })
      .finally(() => setServicesLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    const controller = new AbortController();
    setWorkersLoading(true);
    setWorkersError('');
    api.get('/api/users/workers', { params: { serviceId: selectedService.id }, signal: controller.signal })
      .then(({ data }) => setWorkers(data))
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Error fetching workers:', err);
          const message = err?.response?.data?.error || err?.message || 'Failed to load artists';
          setWorkersError(message);
        }
      })
      .finally(() => setWorkersLoading(false));
    return () => controller.abort();
  }, [selectedService]);

  useEffect(() => {
    if (!(selectedWorker && selectedDate && selectedService)) {
      setUnavailableSlots([]);
      setAvailabilityError('');
      setAvailabilityLoading(false);
      return;
    }
    const controller = new AbortController();
    const dateStr = selectedDate.toISOString().split('T')[0];
    setAvailabilityLoading(true);
    setAvailabilityError('');
    api.get('/api/appointments/availability', {
      params: { worker_id: selectedWorker.id, date: dateStr },
      signal: controller.signal,
    })
      .then(({ data }) => {
        const allUnavailable = [...(data.appointments || []), ...(data.blocks || [])];
        setUnavailableSlots(allUnavailable);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Error fetching availability:', err);
          const message = err?.response?.data?.error || err?.message || 'Failed to load availability';
          setAvailabilityError(message);
          openModal({ title: 'Availability Error', message, type: 'error' });
        }
        setUnavailableSlots([]);
      })
      .finally(() => setAvailabilityLoading(false));
    return () => controller.abort();
  }, [selectedWorker, selectedDate, selectedService]);

  const toMinutes = time => {
    const [t, ampm] = time.split(' ');
    let [h, m] = t.split(':').map(Number);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const resetFormAndSelections = () => {
    setStep(0);
    setSelectedService(null);
    setWorkers([]);
    setWorkersError('');
    setSelectedWorker(null);
    setSelectedDate(new Date());
    setSelectedTime('');
    setErrors({});
    setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    setUnavailableSlots([]);
    setAvailabilityError('');
    setAvailabilityLoading(false);
    setSubmitError('');
    setSubmitSuccess('');
  };

  const openModal = ({
    title,
    message,
    type = 'info',
    closeLabel = 'Close',
    onClose = null,
    noBorder = false,
    dismissible = false,
    showEditIcon = false,
  }) => {
    // noBorder suppresses error border for non-final-step validations
    setModal({
      open: true,
      title,
      message,
      type: noBorder ? `${type}:no-border` : type,
      closeLabel,
      onClose,
      dismissible,
      showEditIcon,
    });
  };

  const closeModal = () => {
    setModal(prev => {
      const cb = prev.onClose;
      const next = { open: false, title: '', message: '', type: 'info', closeLabel: 'Close', onClose: null };
      setTimeout(() => {
        if (typeof cb === 'function') cb();
      }, 0);
      return next;
    });
  };

  const isSlotUnavailable = (slot) => {
    if (!selectedService || !selectedDate) return true;

    const slotStart = toMinutes(slot);
    const duration = selectedService.duration_minutes;
    const slotEnd = slotStart + duration;

    // Enforce end-of-day at 6:00 PM
    const closingMinutes = toMinutes('6:00 PM');
    if (slotEnd > closingMinutes) return true;

    // Gray out past time slots if selected date is today
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    if (isToday) {
      const [hourStr, minuteStr] = slot.replace(/ AM| PM/, '').split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);
      const isPM = slot.includes('PM');
      const slotHour = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);
      const slotMinutes = slotHour * 60 + minute;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= nowMinutes) return true;
    }

    // Overlap detection: if the service window intersects any unavailable period
    return unavailableSlots.some(({ start_time, end_time }) => {
      const unavailableStart = toMinutes(start_time);
      const unavailableEnd = toMinutes(end_time);
      return slotStart < unavailableEnd && slotEnd > unavailableStart;
    });
  };

  // Clear selected time if it becomes invalid due to availability changes or duration constraints
  useEffect(() => {
    if (!selectedTime) return;
    if (isSlotUnavailable(selectedTime)) {
      setSelectedTime('');
    }
  }, [unavailableSlots, selectedService, selectedDate]);

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleNext = async () => {
    if (step === 0 && !selectedService) {
      openModal({ title: 'Selection Required', message: 'Please select a service to continue.', type: 'error', noBorder: true, dismissible: true });
      return;
    }
    if (step === 1 && !selectedWorker) {
      openModal({ title: 'Selection Required', message: 'Please select an artist to continue.', type: 'error', noBorder: true, dismissible: true });
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      openModal({ title: 'Selection Required', message: 'Please choose a date and time to continue.', type: 'error', noBorder: true, dismissible: true });
      return;
    }

    if (step === 3) {
      const newErrors = {};

      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (formData.phone && !/^(09|07)\d{8}$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number (09XXXXXXXX or 07XXXXXXXX)';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const combined = Object.values(newErrors).join('\n');
        openModal({ title: 'Please fix the following', message: combined, type: 'error', closeLabel: 'Edit', showEditIcon: true });
        return;
      }

      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        setSubmitError('');
        setSubmitSuccess('');
        const { data } = await api.post('/api/appointments/book', {
          client_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          client_phone: formData.phone.trim(),
          message: formData.message.trim(),
          service_id: selectedService.id,
          worker_id: selectedWorker.id,
          date: dateStr,
          start_time: selectedTime,
        });

        if (!data?.success) {
          const errMsg = data?.error || 'Booking failed';
          setSubmitError(errMsg);
          openModal({ title: 'Booking Failed', message: errMsg, type: 'error', closeLabel: 'Edit', showEditIcon: true });
          return;
        }

        setSubmitSuccess('Your booking has been submitted successfully!');
        openModal({
          title: 'Booking Confirmed',
          message: 'Your booking has been submitted successfully! You will be redirected to the home page.',
          type: 'success',
          closeLabel: 'Go Home',
          onClose: () => {
            try { resetFormAndSelections(); } catch {}
            if (typeof window !== 'undefined') {
              window.location.assign('/');
            }
          },
        });
      } catch (err) {
        console.error('Error submitting booking:', err);
        const message = err?.response?.data?.error || err?.message || 'Something went wrong while booking. Please try again.';
        setSubmitError(message);
        openModal({ title: 'Booking Error', message, type: 'error', closeLabel: 'Edit', showEditIcon: true });
      }

      return;
    }

    setErrors({});
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      setSelectedWorker(null);
    } else if (step === 2) {
      setSelectedDate(new Date());
      setSelectedTime('');
    } else if (step === 3) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });
    }

    setStep(step - 1);
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="booking-header">
        <h1>Book Your Appointment</h1>
        <p>Select your service, choose a date and time, and we'll take care of the rest!</p>
      </div>

      <div className="booking-form">
        <div className="booking-steps">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`step ${step === i ? 'active' : step > i ? 'done' : ''}`}>
                <span>{i + 1}</span>
                <p>{s}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`step-line ${step > i ? 'filled' : ''}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="form-wrapper">
          {/* Step 0: Services */}
          {step === 0 && (
            <div className="services-step">
              <h2>Select Your Service</h2>
              <p>Choose from our range of premium nail care services.</p>
              {servicesLoading && <div className="alert info">Loading services...</div>}
              {servicesError && <div className="alert error">{servicesError}</div>}
              <div className="service-grid">
                {services.map(srv => {
                  const Icon = Icons[srv.icon] || Icons.FaRegGem;
                  return (
                    <div
                      key={srv.id}
                      className={`service-card-1 ${selectedService?.id === srv.id ? 'selected' : ''}`}
                      onClick={() => setSelectedService(srv)}
                    >
                      <div className="service-header">
                        <span className="service-icon"><Icon /></span>
                        <h3>{srv.title}</h3>
                      </div>
                      <p>{srv.description}</p>
                      {srv?.duration_minutes != null && (
                        <span className="duration">Duration: {formatDuration(Number(srv.duration_minutes))}</span>
                      )}
                      <span className="price">Price: {srv.price} Birr</span>
                      {selectedService?.id === srv.id && (
                        <Icons.FaCheckCircle className="check-icon" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="btn-right">
                <button className="btn" onClick={handleNext}>
                  <span className="btn-text">Continue to Select Artist</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Workers */}
          {step === 1 && (
            <div className="workers-step">
              <h2>Choose Your Nail Artist</h2>
              <p>Select a team member for your service.</p>
              {workersLoading && <div className="alert info">Loading artists...</div>}
              {workersError && <div className="alert error">{workersError}</div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                  className="btn-outline btn-inline"
                  onClick={() => {
                    const qualified = workers.filter(w => w.qualified);
                    if (qualified.length) {
                      const random = qualified[Math.floor(Math.random() * qualified.length)];
                      setSelectedWorker(random);
                      setStep(2); // Move to next step
                    }
                  }}
                >
                  Choose a Random Artist
                </button>
              </div>
              <div className="worker-grid">
                {workers.map(worker => (
                  <div
                    key={worker.id}
                    className={`worker-card ${selectedWorker?.id === worker.id ? 'selected' : ''} ${worker.qualified ? '' : 'unqualified'}`}
                    onClick={() => worker.qualified && setSelectedWorker(worker)}
                  >
                    <div className="worker-card-inner">
                      <img src={worker.image_url} alt={worker.name} className="worker-img" />
                      <div className="worker-details">
                        <h4>{worker.name}</h4>
                        {(() => {
                          const fromObjects = Array.isArray(worker.services)
                            ? worker.services.map(s => s?.title || s?.name).filter(Boolean)
                            : [];
                          const fromString = typeof worker.service_names === 'string' && worker.service_names
                            ? worker.service_names.split(',').map(s => s.trim()).filter(Boolean)
                            : [];
                          const fromArray = Array.isArray(worker.service_names)
                            ? worker.service_names.filter(Boolean)
                            : [];
                          const fromSkills = Array.isArray(worker.skills) ? worker.skills.filter(Boolean) : [];
                          const names = (fromObjects.length ? fromObjects : (fromArray.length ? fromArray : (fromString.length ? fromString : fromSkills)));
                          const display = names.length ? `${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}` : '—';
                          return <div className="worker-services">{display}</div>;
                        })()}
                        {!worker.qualified && <span className="unqualified-label">Not Qualified</span>}
                        {selectedWorker?.id === worker.id && (
                          <Icons.FaCheckCircle className="check-icon" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!workersLoading && !workersError && workers.length === 0 && (
                <div className="alert info">No artists available for the selected service.</div>
              )}
              {/* Buttons */}
              <div className="btn-group" style={{ justifyContent: 'space-between' }}>
                <button className="btn-outline" onClick={handleBack}>
                  <span className="btn-icon">←</span>
                  <span className="btn-text">Back to Services</span>
                </button>
                <button className="btn" onClick={handleNext}>
                  <span className="btn-text">Continue to Date & Time</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="datetime-step">
              <h2>Choose Date & Time</h2>
              <p>Select an available date and time for your appointment.</p>
              <div className="datetime-grid">
                <div className="date-column">
                  <h3>Select a Date</h3>
                  <DatePicker
                    selected={selectedDate}
                    onChange={date => {
                      setSelectedDate(date);
                      setSelectedTime('');
                    }}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                    inline
                  />
                </div>

                <div className="time-column">
                  <h3>Available Time Slots</h3>
                  {availabilityLoading && (
                    <div className="alert info">Checking availability...</div>
                  )}
                  {availabilityError && (
                    <div className="alert error">{availabilityError}</div>
                  )}
                  <div className="time-slots">
                    {timeSlots.map(time => {
                      const isDisabled = isSlotUnavailable(time);

                      return (
                        <button
                          key={time}
                          className={`time-btn ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => !isDisabled && !availabilityLoading && !availabilityError && setSelectedTime(time)}
                          disabled={isDisabled || availabilityLoading || !!availabilityError}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="btn-group" style={{ justifyContent: 'space-between' }}>
                <button className="btn-outline" onClick={handleBack}>
                  <span className="btn-icon">←</span>
                  <span className="btn-text">Back to Select Artist</span>
                </button>
                <button className="btn" onClick={handleNext}>
                  <span className="btn-text">Continue to Your Details</span>
                  <span className="btn-icon">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="details-step">
              <h2>Your Details</h2>
              <p>Please provide your contact information to complete your booking.</p>
              {submitError && <div className="alert error">{submitError}</div>}
              {submitSuccess && <div className="alert success">{submitSuccess}</div>}
              <form className="details-form">
                <div className="input-group">
                  <div className="input-wrapper">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    {errors.firstName && <span className="error">{errors.firstName}</span>}
                  </div>
                  <div className="input-wrapper">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                    {errors.lastName && <span className="error">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="input-wrapper">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
                <div className="input-wrapper">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>
                <div className="input-wrapper">
                  <label>Message (optional)</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </form>
              <div className="booking-summary">
                <h4>Booking Summary</h4>

                <div className="summary-row">
                  <span className="summary-label">Service:</span>
                  <span className="summary-value">
                    {selectedService?.title || 'Not selected'}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Artist:</span>
                  <span className="summary-value">
                    {selectedWorker?.name || 'Not selected'}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Price:</span>
                  <span className="summary-value">
                    {selectedService?.price
                      ? `${Number(selectedService.price).toFixed(2)} Birr`
                      : '--'}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">
                    {selectedDate ? selectedDate.toLocaleDateString() : '--'}
                  </span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Time:</span>
                  <span className="summary-value">
                    {selectedTime || '--'}
                  </span>
                </div>
              </div>
              <div className="btn-group" style={{ justifyContent: 'space-between' }}>
                <button className="btn-outline" onClick={handleBack}>
                  <span className="btn-icon">←</span>
                  <span className="btn-text">Back to Date & Time</span>
                </button>
                <button className="btn btn-complete" onClick={handleNext}>
                  Complete Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div
          className={`modal-overlay`}
          onClick={() => { if (modal.dismissible) closeModal(); }}
        >
          <div
            className={`modal-content ${modal.type.replace(':no-border','')} ${modal.type.includes(':no-border') ? 'no-border' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeModal} aria-label="Close">
              <Icons.FaTimes />
            </button>
            {modal.title && <h3 id="modal-title" className="modal-title">{modal.title}</h3>}
            {modal.message && (
              <div className="modal-body">
                {modal.message.split('\n').map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}
            {modal.closeLabel && modal.closeLabel !== 'Close' && (
              <div className="modal-actions">
                <button className="btn" onClick={closeModal}>
                  {modal.showEditIcon ? <Icons.FaEdit style={{ marginRight: 6 }} /> : null}
                  {modal.closeLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Booking;

