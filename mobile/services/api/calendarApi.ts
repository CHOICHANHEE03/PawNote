const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type CalendarEntryResponse = {
  id: number;
  date: string;
  companion?: string;
  recipeIds: number[];
  memoTitle?: string;
  memoContent?: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export async function getCalendarMonthEntries({
  year,
  month,
  accessToken,
}: {
  year: number;
  month: number;
  accessToken: string;
}): Promise<CalendarEntryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/calendar?year=${year}&month=${month}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("캘린더 월별 조회 실패");
  return response.json();
}

export async function getCalendarDayEntries({
  date,
  accessToken,
}: {
  date: string;
  accessToken: string;
}): Promise<CalendarEntryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/calendar/date/${date}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("캘린더 일별 조회 실패");
  return response.json();
}

export type CalendarCreatePayload = {
  date: string;
  companion?: string;
  recipeIds?: number[];
  memoTitle?: string;
  memoContent?: string;
};

type CreateCalendarEntryParams = {
  payload: CalendarCreatePayload;
  imageUris?: string[];
  accessToken: string;
};

export type CalendarUpdatePayload = {
  date: string;
  companion?: string;
  recipeIds?: number[];
  memoTitle?: string;
  memoContent?: string;
};

type UpdateCalendarEntryParams = {
  id: number;
  payload: CalendarUpdatePayload;
  existingImageUrls?: string[];
  newImageUris?: string[];
  accessToken: string;
};

export async function updateCalendarEntry({
  id,
  payload,
  existingImageUrls = [],
  newImageUris = [],
  accessToken,
}: UpdateCalendarEntryParams) {
  const formData = new FormData();
  formData.append("request", JSON.stringify({ ...payload, existingImageUrls }));

  newImageUris.forEach((uri, index) => {
    formData.append("images", {
      uri,
      name: `calendar-photo-${index}.jpg`,
      type: "image/jpeg",
    } as any);
  });

  const response = await fetch(`${API_BASE_URL}/api/calendar/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const rawText = await response.text();
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    console.log("updateCalendarEntry JSON 파싱 에러:", e);
  }

  if (!response.ok) {
    const error: any = new Error(data?.message || rawText || "캘린더 기록 수정 실패");
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}

export async function deleteCalendarEntry({
  id,
  accessToken,
}: {
  id: number;
  accessToken: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/calendar/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error("캘린더 기록 삭제 실패");
}

export async function createCalendarEntry({
  payload,
  imageUris = [],
  accessToken,
}: CreateCalendarEntryParams) {
  const formData = new FormData();
  formData.append("request", JSON.stringify(payload));

  imageUris.forEach((uri, index) => {
    formData.append("images", {
      uri,
      name: `calendar-photo-${index}.jpg`,
      type: "image/jpeg",
    } as any);
  });

  const response = await fetch(`${API_BASE_URL}/api/calendar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const rawText = await response.text();
  let data = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch (e) {
    console.log("createCalendarEntry JSON 파싱 에러:", e);
  }

  if (!response.ok) {
    const error: any = new Error(data?.message || rawText || "캘린더 기록 저장 실패");
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}
