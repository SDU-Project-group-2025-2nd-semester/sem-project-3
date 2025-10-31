import { useState } from "react";
import mockData from '../../assets/admin/UserMockData.json'

export default function UserManagerPage() {
    const users = mockData?.Users || [] 
    const staff = mockData?.Staff || [] 

    const formatDate = (iso) => {
        if (!iso) return '_'
        try {
            return new Date(iso).toLocaleString()
        } catch {
            return iso
        }
    }

    const formatSchedule = (schedule) => {
        if (!schedule || typeof schedule !== 'object') return '_'
        return Object.entries(schedule).map(([day, time]) => `${day}: ${time}`).join(":")
    }

    return (
         <div className="relative bg-background min-h-screen px-4 mt-20">
         <main className="w-5/6 mx-auto flex flex-col gap-8 pb-32">
            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">
                    Users
                </h2>
                <div className="bg-white rounded-2xl shadow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto  max-lg:block">
                      <thead className="bg-gray-50 max-lg:hidden">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Id</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Current Booked</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Last Book</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Desk Time</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Sitting Time</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="max-lg:block">
                        {users.map((u) => (
                          <tr key={u.id} className="border-t last:border-b max-lg:flex max-lg:flex-wrap max-lg:items-center">
                            <td className="px-4 py-3 lg:text-sm max-lg:text-m max-lg:w-1/10 max-lg:flex-shrink-0 max-lg:pr-2 max-lg:py-1">
                              {u.id}</td>
                            <td className="px-4 py-3 lg:text-sm max-lg:flex-1 max-lg:w-9/10 max-lg:text-m max-lg:py-0">
                              {u.Name}</td>
                            <td className="px-4 py-3 text-sm max-lg: max-lg:w-full max-lg:py-0">{u.Email}</td>
                            <td className="px-4 py-3 text-sm max-lg:block max-lg:w-full max-lg:pt-2 max-lg:pb-0">
                              <span className="font-semibold lg:hidden">Current Booked: </span>
                              {u.CurrentBooked ?? '-'}</td>
                            <td className="px-4 py-3 text-sm max-lg:block max-lg:w-full max-lg:py-0">
                              <span className="font-semibold lg:hidden">Last Booked: </span>
                              {formatDate(u.LastBook)}</td>
                            <td className="px-4 py-3 text-sm max-lg:block max-lg:w-full max-lg:py-0">
                              <span className="font-semibold lg:hidden">Desk Time: </span>
                              {u.DeskTime ?? '-'}</td>
                            <td className="px-4 py-3 text-sm max-lg:block max-lg:w-full max-lg:py-0">
                              <span className="font-semibold lg:hidden">Sitting Time: </span>
                              {u.SittingTime ?? '-'}</td>
                            <td className="px-4 py-3 text-sm max-lg:flex max-lg:justify-between max-lg:items-center">
                              <button
                                className="bg-accent text-white px-3 py-1 rounded-lg text-xs hover:bg-accent/90 disabled:opacity-50"
                                disabled={!u.CurrentBooked}
                                onClick={() => console.log('Cancel booking for', u.id)}
                              >
                                Cancel Booking
                              </button>
                              <button
                                className="bg-danger-500 text-white mx-4 px-3 py-1 rounded-lg text-xs hover:bg-danger-600 disabled:opacity-50"
                                onClick={() => console.log('Remove Account for', u.id)}
                              >
                                <span className="material-symbols-outlined text-sm leading-none">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">
                    Staff
                </h2>
                <div className="bg-white rounded-2xl shadow">
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto max-lg:block">
                      <thead className="bg-gray-50 max-lg:hidden">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Id</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">JobDescription</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">WorkingSchedule</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="max-lg:block">
                        {staff.map((s) => (
                          <tr key={s.id} className="border-t last:border-b max-lg:flex max-lg:flex-wrap max-lg:items-center">
                            <td className="px-4 py-3 text-sm max-lg:w-1/10 max-lg:flex-shrink-0 max-lg:pr-2 max-lg:py-1">{s.id}</td>
                            <td className="px-4 py-3 lg:text-sm max-lg:flex-1 max-lg:w-9/10 max-lg:text-m max-lg:py-0">{s.Name}</td>
                            <td className="px-4 py-3 text-sm max-lg: max-lg:w-full max-lg:py-0">{s.Email}</td>
                            <td className="px-4 py-3 text-sm max-lg:block max-lg:w-full max-lg:py-0">
                              <span className="font-semibold lg:hidden">Job Description: </span>
                              {s.JobDescription}</td>
                            <td className="px-4 py-3 text-sm max-lg:block max-lg:w-full max-lg:py-0">
                              <details className="cursor-pointer group">
                                <summary className="text-sm max-lg:font-semibold">View schedule</summary>
                                <div className="cursor-pointer mt-2 text-xs space-y-1">
                                  {s.WorkingSchedule
                                    ? Object.entries(s.WorkingSchedule).map(([day, time]) => (
                                        <div key={day}><span className="font-medium mr-1">{day}:</span>{time}</div>
                                      ))
                                    : <div>-</div>
                                  }
                                </div>
                              </details>
                            </td>
                            <td className="px-4 py-3 text-sm max-lg:flex max-lg:flex-col max-lg:items-start  max-lg:justify-start">
                              <button
                                className="bg-danger-500 text-white mx-4 px-3 py-1 rounded-lg text-xs hover:bg-danger-600 disabled:opacity-50 max-lg:mx-0"
                                onClick={() => console.log('Remove Account for', s.id)}
                              >
                                <span className="material-symbols-outlined text-sm leading-none">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {staff.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  </div>
                </section>
        </main>
        </div>
    );
}