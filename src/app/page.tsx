"use client";
import React, { useState } from 'react';
import { format, isToday, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import styles from './modal.module.css';

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedule, setSchedule] = useState<string>('');
  const [scheduleMap, setScheduleMap] = useState<{ [date: string]: string[] }>({});
  const [currentView, setCurrentView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleDateCellClick = (day: Date) => {
    setSelectedDate(day);
    setShowModal(true);
  };

  const handleScheduleClick = (day: Date, scheduleIndex: number) => {
    setSelectedDate(day);
    setShowModal(true);

    const formattedDate = format(day, 'yyyy-MM-dd');
    setSchedule(scheduleMap[formattedDate][scheduleIndex]);
    setEditingIndex(scheduleIndex);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSchedule('');
    setEditingIndex(null);
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSchedule(e.target.value);
  };

  const handleScheduleSubmit = () => {
    if (!selectedDate) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const updatedScheduleMap = { ...scheduleMap };

    if (editingIndex !== null) {
      updatedScheduleMap[formattedDate][editingIndex] = schedule;
    } else {
      if (updatedScheduleMap[formattedDate]) {
        updatedScheduleMap[formattedDate].push(schedule);
      } else {
        updatedScheduleMap[formattedDate] = [schedule];
      }
    }

    setScheduleMap(updatedScheduleMap);
    handleModalClose();
  };

  const handleDeleteSchedule = () => {
    if (!selectedDate || editingIndex === null) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const updatedScheduleMap = { ...scheduleMap };

    updatedScheduleMap[formattedDate].splice(editingIndex, 1);

    if (updatedScheduleMap[formattedDate].length === 0) {
      delete updatedScheduleMap[formattedDate];
    }

    setScheduleMap(updatedScheduleMap);
    handleModalClose();
  };

  const handlePrev = () => {
    setCurrentDate(currentView === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(currentView === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const toggleView = () => {
    setCurrentView(currentView === 'month' ? 'week' : 'month');
  };

  const renderDays = () => {
    if (currentView === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      return daysInMonth.map((day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const schedules = scheduleMap[formattedDate] || [];

        return (
          <div key={day.getTime()} className={`day ${isToday(day) ? 'today' : ''}`} onClick={() => handleDateCellClick(day)}>
            <span>{format(day, 'd')}</span>
            <div className="schedule-list">
              {schedules.map((schedule, index) => (
                <div key={index} className="schedule" onClick={() => handleScheduleClick(day, index)}>{schedule}</div>
              ))}
              {schedules.length > 2 && <div className="more">+ {schedules.length - 2} more</div>}
            </div>
            <div className="empty-space"></div>
          </div>
        );
      });
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

      return daysInWeek.map((day) => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        const schedules = scheduleMap[formattedDate] || [];

        return (
          <div key={day.getTime()} className={`day ${isToday(day) ? 'today' : ''}`} onClick={() => handleDateCellClick(day)}>
            <span>{format(day, 'EEE d')}</span>
            <div className="schedule-list">
              {schedules.map((schedule, index) => (
                <div key={index} className="schedule" onClick={() => handleScheduleClick(day, index)}>{schedule}</div>
              ))}
              {schedules.length > 2 && <div className="more">+ {schedules.length - 2} more</div>}
            </div>
            <div className="empty-space"></div>
          </div>
        );
      });
    }
  };

  return (
    <>
      <div className="header-center">
        <div className="view-toggle">
          <button onClick={toggleView}>{currentView === 'month' ? '週表示' : '月表示'}</button>
        </div>
        <div className="month-header">
          <button onClick={handlePrev}>Previous</button>
          <h2>{currentView === 'month' ? format(currentDate, 'MMMM yyyy') : 'Week of ' + format(currentDate, 'MMMM d, yyyy')}</h2>
          <button onClick={handleNext}>Next</button>
        </div>
      </div>
      <div className="calendar">
        {renderDays()}
        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <span className={styles.close} onClick={handleModalClose}>&times;</span>
              <h2>{format(selectedDate!, 'MMMM d, yyyy')}</h2>
              <input type="text" value={schedule} onChange={handleScheduleChange} placeholder="Enter your schedule" />
              {editingIndex !== null ? (
                <>
                  <button onClick={handleScheduleSubmit}>Update</button>
                  <button onClick={handleDeleteSchedule}>Delete</button>
                </>
              ) : (
                <button onClick={handleScheduleSubmit}>Register</button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Calendar;
