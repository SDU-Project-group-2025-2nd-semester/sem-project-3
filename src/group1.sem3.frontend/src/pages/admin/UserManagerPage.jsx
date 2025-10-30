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
                  {/* Desktop table (hidden on small screens) */}
                  <div className="overflow-x-auto hidden md:block">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gray-50">
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
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-t last:border-b">
                            <td className="px-4 py-3 text-sm">{u.id}</td>
                            <td className="px-4 py-3 text-sm">{u.Name}</td>
                            <td className="px-4 py-3 text-sm text-primary/90">{u.Email}</td>
                            <td className="px-4 py-3 text-sm">{u.CurrentBooked ?? '-'}</td>
                            <td className="px-4 py-3 text-sm">{formatDate(u.LastBook)}</td>
                            <td className="px-4 py-3 text-sm">{u.DeskTime ?? '-'}</td>
                            <td className="px-4 py-3 text-sm">{u.SittingTime ?? '-'}</td>
                            <td className="px-4 py-3 text-sm">
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

                  {/* Mobile stacked cards*/}
                  <div className="md:hidden p-4 space-y-3 mt-20">
                    {users.map((u) => (
                      <div key={u.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-m font-medium">{u.Name}</div>
                            <div className="text-xs text-primary/90">{u.Email}</div>
                          </div>
                          <div className="text-right">
                            <button
                                    className="bg-danger-500 text-white px-2 py-1 rounded-lg text-xs hover:bg-danger-600"
                                    onClick={() => console.log('Remove Account for', u.id)}
                                >
                                    <span className="material-symbols-outlined text-sm leading-none">delete</span>
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 gap-2 text-xs">
                          <div><span className="font-semibold">Current Book:</span> {u.CurrentBooked ?? '-'}</div>
                          <div><span className="font-semibold">Last Book:</span> {formatDate(u.LastBook)}</div>
                          <div><span className="font-semibold">Desk Time:</span> {u.DeskTime ?? '-'}</div>
                          <div><span className="font-semibold">Sitting Time:</span> {u.SittingTime ?? '-'}</div>
                          <div className="flex gap-2 justify-end">
                            <button
                              className="bg-accent text-white px-3 py-1 rounded-lg text-xxs hover:bg-accent/90 disabled:opacity-50"
                              disabled={!u.CurrentBooked}
                              onClick={() => console.log('Cancel booking for', u.id)}
                            >
                              Cancel Booking
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <div className="text-center text-sm text-gray-500">No users found</div>
                    )}
                  </div>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-secondary mb-4">
                    Staff
                </h2>
                <div className="bg-white rounded-2xl shadow">
                  {/* Desktop table (hidden on small screens) */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">Id</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">JobDescription</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">WorkingSchedule</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((s) => (
                          <tr key={s.id} className="border-t last:border-b">
                            <td className="px-4 py-3 text-sm">{s.id}</td>
                            <td className="px-4 py-3 text-sm">{s.Name}</td>
                            <td className="px-4 py-3 text-sm text-primary/90">{s.Email}</td>
                            <td className="px-4 py-3 text-sm">{s.JobDescription}</td>
                            <td className="px-4 py-3 text-sm">
                              <details className="cursor-pointer group">
                                {/* <summary className="cursor-pointer text-sm text-primary/90">View schedule</summary> */}
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
                            <td className="px-4 py-3 text-sm">
                              <button
                                className="bg-danger-500 text-white mx-4 px-3 py-1 rounded-lg text-xs hover:bg-danger-600 disabled:opacity-50"
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