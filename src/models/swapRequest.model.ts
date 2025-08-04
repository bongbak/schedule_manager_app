import db from "../db";

export const createSwapRequest = async (fromShiftId: number) => {
  const [result] = await db.execute(
    `INSERT INTO SwapRequest (from_shift_id, to_shift_id, status) VALUES (?, NULL, 'pending')`,
    [fromShiftId]
  );
  return result;
};

export const getAllSwapRequests = async () => {
  const [rows] = await db.execute(
    `SELECT * FROM SwapRequest WHERE status = 'pending'`
  );
  return rows;
};

export const acceptSwapRequest = async (requestId: number, toShiftId: number) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 요청 승인 처리
    await conn.execute(
      `UPDATE SwapRequest SET to_shift_id = ?, status = 'approved', approved_at = NOW() WHERE request_id = ?`,
      [toShiftId, requestId]
    );

    // Shift 정보 교체
    const [[{ from_shift_id }]]: any = await conn.execute(
      `SELECT from_shift_id FROM SwapRequest WHERE request_id = ?`,
      [requestId]
    );

    const [[{ staff_id: fromStaff }]]: any = await conn.execute(
      `SELECT staff_id FROM Shift WHERE shift_id = ?`,
      [from_shift_id]
    );
    const [[{ staff_id: toStaff }]]: any = await conn.execute(
      `SELECT staff_id FROM Shift WHERE shift_id = ?`,
      [toShiftId]
    );

    await conn.execute(
      `UPDATE Shift SET staff_id = ? WHERE shift_id = ?`,
      [toStaff, from_shift_id]
    );
    await conn.execute(
      `UPDATE Shift SET staff_id = ? WHERE shift_id = ?`,
      [fromStaff, toShiftId]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
