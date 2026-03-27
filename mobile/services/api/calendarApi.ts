const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
