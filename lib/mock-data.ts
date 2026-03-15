export const currentUser = {
  id: "user-1",
  email: "john@example.com",
  name: "John Doe",
  isPro: false,
  createdAt: new Date("2024-01-15"),
};

export const itemTypes = [
  { id: "type-1", name: "Snippet", icon: "code", color: "#10b981", isSystem: true },
  { id: "type-2", name: "Prompt", icon: "bot", color: "#8b5cf6", isSystem: true },
  { id: "type-3", name: "Note", icon: "file-text", color: "#3b82f6", isSystem: true },
  { id: "type-4", name: "Command", icon: "terminal", color: "#f59e0b", isSystem: true },
  { id: "type-5", name: "File", icon: "file", color: "#6b7280", isSystem: true },
  { id: "type-6", name: "Image", icon: "image", color: "#ec4899", isSystem: true },
  { id: "type-7", name: "URL", icon: "link", color: "#14b8a6", isSystem: true },
];

export const tags = [
  { id: "tag-1", name: "react", userId: "user-1" },
  { id: "tag-2", name: "auth", userId: "user-1" },
  { id: "tag-3", name: "hooks", userId: "user-1" },
  { id: "tag-4", name: "api", userId: "user-1" },
  { id: "tag-5", name: "error-handling", userId: "user-1" },
  { id: "tag-6", name: "performance", userId: "user-1" },
  { id: "tag-7", name: "git", userId: "user-1" },
];

export const itemTags = [
  { itemId: "item-1", tagId: "tag-1" },
  { itemId: "item-1", tagId: "tag-3" },
  { itemId: "item-9", tagId: "tag-1" },
  { itemId: "item-9", tagId: "tag-2" },
  { itemId: "item-9", tagId: "tag-3" },
  { itemId: "item-10", tagId: "tag-4" },
  { itemId: "item-10", tagId: "tag-5" },
];

export const collections = [
  { id: "col-1", name: "React Patterns", description: "Common React patterns and hooks", isFavorite: true, userId: "user-1", createdAt: new Date("2024-02-01") },
  { id: "col-2", name: "AI Prompts", description: "Curated AI prompts for coding", isFavorite: false, userId: "user-1", createdAt: new Date("2024-02-15") },
  { id: "col-3", name: "Git Commands", description: "Frequently used git commands", isFavorite: true, userId: "user-1", createdAt: new Date("2024-03-01") },
  { id: "col-4", name: "Python Snippets", description: "Useful Python code snippets", isFavorite: false, userId: "user-1", createdAt: new Date("2024-02-20") },
  { id: "col-5", name: "Context Files", description: "AI context files for projects", isFavorite: true, userId: "user-1", createdAt: new Date("2024-03-05") },
  { id: "col-6", name: "Interview Prep", description: "Technical interview preparation", isFavorite: false, userId: "user-1", createdAt: new Date("2024-03-10") },
];

export const items = [
  {
    id: "item-1",
    title: "useDebounce Hook",
    contentType: "text",
    content: `export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}`,
    description: "A custom hook for debouncing values",
    isFavorite: true,
    isPinned: true,
    language: "typescript",
    userId: "user-1",
    typeId: "type-1",
    collectionId: "col-1",
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "item-2",
    title: "Code Review Prompt",
    contentType: "text",
    content: "Review the following code for bugs, performance issues, and best practices. Explain any problems found and suggest improvements:\n\n```\n[CODE]\n```",
    description: "Prompt for AI code review",
    isFavorite: false,
    isPinned: false,
    language: null,
    userId: "user-1",
    typeId: "type-2",
    collectionId: "col-2",
    createdAt: new Date("2024-02-20"),
  },
  {
    id: "item-3",
    title: "Git Undo Last Commit",
    contentType: "text",
    content: "git reset --soft HEAD~1",
    description: "Undo the last commit while keeping changes staged",
    isFavorite: true,
    isPinned: false,
    language: "bash",
    userId: "user-1",
    typeId: "type-4",
    collectionId: "col-3",
    createdAt: new Date("2024-03-05"),
  },
  {
    id: "item-4",
    title: "Next.js Documentation",
    contentType: "text",
    content: "https://nextjs.org/docs",
    description: "Official Next.js documentation",
    isFavorite: false,
    isPinned: true,
    language: null,
    userId: "user-1",
    typeId: "type-7",
    collectionId: null,
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "item-5",
    title: "React Context Pattern",
    contentType: "text",
    content: `import { createContext, useContext, ReactNode } from 'react';

interface ContextType {
  value: string;
  setValue: (val: string) => void;
}

const MyContext = createContext<ContextType | undefined>(undefined);

export function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('default');
  
  return (
    <MyContext.Provider value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
}`,
    description: "Standard React Context provider pattern",
    isFavorite: true,
    isPinned: false,
    language: "typescript",
    userId: "user-1",
    typeId: "type-1",
    collectionId: "col-1",
    createdAt: new Date("2024-02-05"),
  },
  {
    id: "item-6",
    title: "SQL Explain Query",
    contentType: "text",
    content: "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';",
    description: "Analyze query performance in PostgreSQL",
    isFavorite: false,
    isPinned: false,
    language: "sql",
    userId: "user-1",
    typeId: "type-4",
    collectionId: "col-3",
    createdAt: new Date("2024-03-12"),
  },
  {
    id: "item-7",
    title: "Python List Comprehension",
    contentType: "text",
    content: "squares = [x**2 for x in range(10)]",
    description: "Example of Python list comprehension",
    isFavorite: false,
    isPinned: false,
    language: "python",
    userId: "user-1",
    typeId: "type-1",
    collectionId: "col-4",
    createdAt: new Date("2024-02-25"),
  },
  {
    id: "item-8",
    title: "Docker Run Postgres",
    contentType: "text",
    content: "docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:latest",
    description: "Run PostgreSQL in Docker container",
    isFavorite: true,
    isPinned: false,
    language: "bash",
    userId: "user-1",
    typeId: "type-4",
    collectionId: "col-3",
    createdAt: new Date("2024-03-15"),
  },
  {
    id: "item-9",
    title: "useAuth Hook",
    contentType: "text",
    content: `export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await getSession();
      setUser(session?.user || null);
    } finally {
      setLoading(false);
    }
  }

  return { user, loading };
}`,
    description: "Custom authentication hook for React applications",
    isFavorite: true,
    isPinned: true,
    language: "typescript",
    userId: "user-1",
    typeId: "type-1",
    collectionId: "col-1",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "item-10",
    title: "API Error Handling Pattern",
    contentType: "text",
    content: `async function fetchWithRetry(url: string, options?: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return response;
    } catch (error) {
      lastError = error as Error;
      await delay(1000 * Math.pow(2, i));
    }
  }
  
  throw lastError;
}`,
    description: "Fetch wrapper with exponential backoff retry logic",
    isFavorite: true,
    isPinned: true,
    language: "typescript",
    userId: "user-1",
    typeId: "type-1",
    collectionId: "col-6",
    createdAt: new Date("2024-01-12"),
  },
  {
    id: "item-11",
    title: "React Performance Tips",
    contentType: "text",
    content: "1. Use React.memo for expensive components\n2. Use useMemo for expensive calculations\n3. Use useCallback for function props\n4. Virtualize long lists\n5. Code split with React.lazy",
    description: "Common React performance optimization techniques",
    isFavorite: false,
    isPinned: false,
    language: null,
    userId: "user-1",
    typeId: "type-3",
    collectionId: "col-6",
    createdAt: new Date("2024-03-08"),
  },
  {
    id: "item-12",
    title: "Git Rebase Interactive",
    contentType: "text",
    content: "git rebase -i HEAD~3",
    description: "Interactive rebase last 3 commits",
    isFavorite: false,
    isPinned: false,
    language: "bash",
    userId: "user-1",
    typeId: "type-4",
    collectionId: "col-3",
    createdAt: new Date("2024-03-18"),
  },
];
