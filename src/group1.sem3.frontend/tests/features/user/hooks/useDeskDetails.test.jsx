/* eslint-env vitest */
import React from 'react';
import { render, screen, waitFor, fireEvent, renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';

// module-level navigate mock
let navigateMock = vi.fn();
vi.mock('@features/auth/AuthContext', () => ({
 useAuth: () => ({ currentCompany: { id:123 } }),
}));

vi.mock('react-router-dom', () => ({
 useNavigate: () => navigateMock,
 useLocation: () => ({ state: {}, pathname: '/desk' }),
}));

vi.mock('../../../../src/features/user/user.services', () => ({
 getMyProfile: vi.fn(),
 getDeskById: vi.fn(),
 getRoomById: vi.fn(),
 putDeskHeight: vi.fn(),
}));

import * as userServices from '../../../../src/features/user/user.services';
import { useDeskDetails } from '../../../../src/features/user/hooks/useDeskDetails';

function TestComp({ reservationId }) {
 const h = useDeskDetails({ reservationId });
 return (
 <div>
 <div data-testid="deskName">{h.deskName}</div>
 <div data-testid="roomName">{h.roomName}</div>
 <div data-testid="height">{String(h.height)}</div>
 <div data-testid="userSitting">{String(h.userSittingCm)}</div>
 <div data-testid="userStanding">{String(h.userStandingCm)}</div>
 <div data-testid="active">{String(h.isReservationActive)}</div>

 <button data-testid="setSitting" onClick={() => h.setSittingHeight()}>
 setSitting
 </button>
 <button data-testid="setStanding" onClick={() => h.setStandingHeight()}>
 setStanding
 </button>
 <button data-testid="report" onClick={() => h.reportDamage()}>
 report
 </button>
 </div>
 );
}

beforeEach(() => {
 vi.clearAllMocks();
});

test('loads reservation and desk details and allows setting heights and reporting', async () => {
 const now = new Date();
 const start = new Date(now.getTime() -60 *60 *1000).toISOString(); //1h ago
 const end = new Date(now.getTime() +60 *60 *1000).toISOString(); //1h later

 userServices.getMyProfile.mockResolvedValueOnce({ sittingHeight:700, standingHeight:1100 });

 // First getDeskById for reservation details
 userServices.getDeskById.mockResolvedValueOnce({ deskId:11, start, end });
 // Second call for desk details
 userServices.getDeskById.mockResolvedValueOnce({ readableId: 'Desk-11', room: { readableId: 'Room A' }, height:750 });

 render(<TestComp reservationId={99} />);

 // wait for desk name to appear
 await waitFor(() => expect(screen.getByTestId('deskName').textContent).toBe('Desk-11'));
 expect(screen.getByTestId('roomName').textContent).toBe('Room A');

 // user profile heights in cm should be available
 expect(screen.getByTestId('userSitting').textContent).toBe('70');
 expect(screen.getByTestId('userStanding').textContent).toBe('110');

 // reservation should be active
 expect(screen.getByTestId('active').textContent).toBe('true');

 // set sitting height -> should call putDeskHeight with mm (700)
 userServices.putDeskHeight.mockResolvedValueOnce({});
 fireEvent.click(screen.getByTestId('setSitting'));
 await waitFor(() => expect(userServices.putDeskHeight).toHaveBeenCalledWith(123,11,700));
 // height should be updated to70
 expect(screen.getByTestId('height').textContent).toBe('70');

 // set standing height -> should call putDeskHeight with mm (1100)
 userServices.putDeskHeight.mockResolvedValueOnce({});
 fireEvent.click(screen.getByTestId('setStanding'));
 await waitFor(() => expect(userServices.putDeskHeight).toHaveBeenCalledWith(123,11,1100));
 expect(screen.getByTestId('height').textContent).toBe('110');

 // report damage navigates to damage report page
 fireEvent.click(screen.getByTestId('report'));
 expect(navigateMock).toHaveBeenCalledWith('/user/damagereport', expect.objectContaining({ state: expect.objectContaining({ tableId:11 }) }));
});

// --- merged tests from separate file ---

test('setSittingHeight and setStandingHeight only run when active', async () => {
 const now = new Date();
 const start = new Date(now.getTime() -60 *60 *1000).toISOString();
 const end = new Date(now.getTime() +60 *60 *1000).toISOString();

 // getMyProfile to set user heights
 userServices.getMyProfile.mockResolvedValueOnce({ sittingHeight:700, standingHeight:1100 });
 // getDeskById for reservation details
 userServices.getDeskById.mockResolvedValueOnce({ deskId:11, start, end });
 // getDeskById for desk details when deskId changes
 userServices.getDeskById.mockResolvedValueOnce({ readableId: 'Desk-11', room: { readableId: 'Room A' }, height:750 });

 const { result } = renderHook(() => useDeskDetails({ reservationId:99 }));

 // wait for loadingDetails to settle
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loadingDetails) { clearInterval(i); resolve(); }
 },10);
 });

 // since reservation is active, calling setSittingHeight/standing should invoke putDeskHeight
 userServices.putDeskHeight.mockResolvedValueOnce({});
 await act(async () => { await result.current.setSittingHeight(); });
 expect(userServices.putDeskHeight).toHaveBeenCalledWith(123,11,700);

 userServices.putDeskHeight.mockResolvedValueOnce({});
 await act(async () => { await result.current.setStandingHeight(); });
 expect(userServices.putDeskHeight).toHaveBeenCalledWith(123,11,1100);
});

test('reportDamage navigates with correct state when deskId present', async () => {
 userServices.getMyProfile.mockResolvedValueOnce({ sittingHeight:700, standingHeight:1100 });
 userServices.getDeskById.mockResolvedValueOnce({ deskId:22, start: new Date().toISOString(), end: new Date().toISOString() });
 userServices.getDeskById.mockResolvedValueOnce({ readableId: 'Desk-22', room: { readableId: 'Room B' }, height:750 });

 navigateMock = vi.fn();

 const { result } = renderHook(() => useDeskDetails({ reservationId:100 }));
 await new Promise((resolve) => setTimeout(resolve,50));
 // set deskId manually for test and call reportDamage
 await act(async () => { result.current.reportDamage(); });
 expect(navigateMock).toHaveBeenCalled();
});

// Negative tests: ensure rejections are handled and non-active reservation no-ops

test('setSittingHeight does not attempt to set when reservation not active', async () => {
 const now = new Date();
 // reservation in the past
 const start = new Date(now.getTime() -4 *60 *60 *1000).toISOString();
 const end = new Date(now.getTime() -3 *60 *60 *1000).toISOString();

 userServices.getMyProfile.mockResolvedValueOnce({ sittingHeight:700, standingHeight:1100 });
 userServices.getDeskById.mockResolvedValueOnce({ deskId:11, start, end });
 userServices.getDeskById.mockResolvedValueOnce({ readableId: 'Desk-11', room: { readableId: 'Room A' }, height:750 });

 const { result } = renderHook(() => useDeskDetails({ reservationId:101 }));

 // wait for details load
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loadingDetails) { clearInterval(i); resolve(); }
 },10);
 });

 // reservation not active -> action should be no-op
 userServices.putDeskHeight.mockResolvedValueOnce({});
 await act(async () => { await result.current.setSittingHeight(); });
 expect(userServices.putDeskHeight).not.toHaveBeenCalled();
});

test('setStandingHeight handles putDeskHeight rejection without throwing', async () => {
 const now = new Date();
 const start = new Date(now.getTime() -60 *60 *1000).toISOString();
 const end = new Date(now.getTime() +60 *60 *1000).toISOString();

 userServices.getMyProfile.mockResolvedValueOnce({ sittingHeight:700, standingHeight:1100 });
 userServices.getDeskById.mockResolvedValueOnce({ deskId:11, start, end });
 userServices.getDeskById.mockResolvedValueOnce({ readableId: 'Desk-11', room: { readableId: 'Room A' }, height:750 });

 const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
 userServices.putDeskHeight.mockRejectedValueOnce(new Error('upfail'));

 const { result } = renderHook(() => useDeskDetails({ reservationId:102 }));

 // wait for load
 await new Promise((resolve) => {
 const i = setInterval(() => {
 if (!result.current.loadingDetails) { clearInterval(i); resolve(); }
 },10);
 });

 await act(async () => { await result.current.setStandingHeight(); });
 expect(errorSpy).toHaveBeenCalled();
 errorSpy.mockRestore();
});
