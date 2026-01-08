import { Book, ReadingList, Review, Recommendation } from '@/types';

/**
 * ============================================================================
 * API SERVICE LAYER - BACKEND COMMUNICATION
 * ============================================================================
 *
 * Şu anda:
 * - Books ve Reading Lists için gerçek AWS API Gateway + Lambda kullanıyoruz
 * - Diğer şeyler (reviews, recommendations, admin book işlemleri) şimdilik mock
 *
 * .env dosyanda:
 * VITE_API_BASE_URL=https://4b1qfbrpxj.execute-api.us-east-1.amazonaws.com/dev
 * şeklinde ayarlı olmalı.
 * ============================================================================
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Şimdilik Cognito yok, o yüzden sabit userId kullanıyoruz
const CURRENT_USER_ID = '1';

async function parseApiJson<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (typeof data === 'string') {
    return JSON.parse(data) as T;
  }

  if (data && typeof data === 'object' && 'body' in data) {
    const body = (data as { body: unknown }).body;
    if (typeof body === 'string') {
      return JSON.parse(body) as T;
    }
    return body as T;
  }

  return data as T;
}

/**
 * BOOKS
 * ============================================================================
 */

// Tüm kitapları getir
export async function getBooks(): Promise<Book[]> {
  const response = await fetch(`${API_BASE_URL}/books`);

  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }

  const data = await parseApiJson<unknown>(response);
  if (Array.isArray(data)) {
    return data as Book[];
  }
  if (data && typeof data === 'object' && 'Items' in data) {
    return (data as { Items: Book[] }).Items;
  }
  if (data && typeof data === 'object' && 'books' in data) {
    return (data as { books: Book[] }).books;
  }
  return [];
}

// Tek bir kitabı ID ile getir
export async function getBook(id: string): Promise<Book | null> {
  const response = await fetch(`${API_BASE_URL}/books/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch book');
  }

  return parseApiJson<Book | null>(response);
}

/**
 * Aşağıdaki book create/update/delete fonksiyonları
 * henüz gerçek backend’e bağlı değil. Week 3–4’te
 * bunlar için de Lambda + API Gateway eklenecek.
 */

// Yeni kitap oluştur (şimdilik sadece fake dönüyor)
export async function createBook(book: Omit<Book, 'id'>): Promise<Book> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBook: Book = {
        ...book,
        id: Date.now().toString(),
      };
      resolve(newBook);
    }, 500);
  });
}

// Kitap güncelle (şimdilik sadece local fake)
export async function updateBook(id: string, book: Partial<Book>): Promise<Book> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updatedBook: Book = {
        // Gerçekte buraya mevcut kitabı ekleyip merge etmen gerekir
        ...(book as Book),
        id,
      };
      resolve(updatedBook);
    }, 500);
  });
}

// Kitap sil (şimdilik no-op)
export async function deleteBook(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 300);
  });
}

/**
 * RECOMMENDATIONS (Bedrock) – Week 4’te gerçek olacak
 * Şimdilik tamamen mock.
 */

export async function getRecommendations(): Promise<Recommendation[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          bookId: '1',
          reason:
            'Based on your interest in philosophical fiction, this book explores themes of choice and regret.',
          confidence: 0.92,
        },
        {
          id: '2',
          bookId: '2',
          reason:
            'If you enjoy science-based thrillers, this space adventure combines humor with hard science.',
          confidence: 0.88,
        },
      ];
      resolve(mockRecommendations);
    }, 1000);
  });
}

/**
 * READING LISTS
 * ============================================================================
 * Buradan sonrası tamamen senin yaptığın Lambda’lara bağlı 🌟
 * Endpoints:
 *  - GET    /reading-lists?userId=1
 *  - POST   /reading-lists
 *  - PUT    /reading-lists/{id}
 *  - DELETE /reading-lists/{id}
 */

// Kullanıcının bütün reading listelerini getir
export async function getReadingLists(): Promise<ReadingList[]> {
  const response = await fetch(`${API_BASE_URL}/reading-lists?userId=${CURRENT_USER_ID}`);

  if (!response.ok) {
    throw new Error('Failed to fetch reading lists');
  }

  const data = await parseApiJson<unknown>(response);
  if (Array.isArray(data)) {
    return data as ReadingList[];
  }
  if (data && typeof data === 'object' && 'Items' in data) {
    return (data as { Items: ReadingList[] }).Items;
  }
  if (data && typeof data === 'object' && 'readingLists' in data) {
    return (data as { readingLists: ReadingList[] }).readingLists;
  }
  return [];
}

// Yeni reading list oluştur
export async function createReadingList(
  list: Omit<ReadingList, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ReadingList> {
  const payload = {
    ...list,
    userId: CURRENT_USER_ID,
  };

  const response = await fetch(`${API_BASE_URL}/reading-lists`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create reading list');
  }

  return parseApiJson<ReadingList>(response);
}

// Reading list güncelle
export async function updateReadingList(
  id: string,
  list: Partial<ReadingList>
): Promise<ReadingList> {
  const payload = {
    ...list,
    userId: CURRENT_USER_ID,
  };

  const response = await fetch(`${API_BASE_URL}/reading-lists/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update reading list');
  }

  return parseApiJson<ReadingList>(response);
}

// Reading list sil
export async function deleteReadingList(id: string): Promise<void> {
  const payload = {
    userId: CURRENT_USER_ID,
  };

  const response = await fetch(`${API_BASE_URL}/reading-lists/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete reading list');
  }

  // 204 No Content ise zaten body yok, direk return
}

/**
 * REVIEWS – henüz backend yok, mock
 */

export async function getReviews(bookId: string): Promise<Review[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockReviews: Review[] = [
        {
          id: '1',
          bookId,
          userId: '1',
          rating: 5,
          comment: 'Absolutely loved this book! A must-read.',
          createdAt: '2024-11-01T10:00:00Z',
        },
      ];
      resolve(mockReviews);
    }, 500);
  });
}

export async function createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReview: Review = {
        ...review,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      resolve(newReview);
    }, 500);
  });
}
