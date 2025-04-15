"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  CopyIcon,
  SearchIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  AlertCircleIcon,
  LoaderIcon
} from "lucide-react";

const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="relative">
      <LoaderIcon size={40} className="text-blue-500 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    </div>
    <p className="mt-4 text-gray-400">Searching data breaches...</p>
  </div>
);

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  const copyButtonRef = useRef<Record<string, HTMLButtonElement | null>>({});

  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handleSearch = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a username or email to search");
      return;
    }

    setLoading(true);
    setError("");
    setCurrentPage(1); 

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const data = await response.json();

      if (data.lines && Array.isArray(data.lines)) {
        setResults(data.lines);
        setTotalResults(data.count || data.lines.length);

        if (data.lines.length === 0) {
          setError("No records found for this search term");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    const button = copyButtonRef.current[index];
    if (button) {
      button.classList.add("copy-pulse");
      setTimeout(() => {
        button.classList.remove("copy-pulse");
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 py-4 px-6 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon size={24} className="text-red-500" />
          <h1 className="text-xl font-bold">Data Breach Lookup</h1>
        </div>
        <div className="flex items-center space-x-2">
          <DatabaseIcon size={18} className="text-blue-400" />
          <span className="text-sm text-gray-300">Breach Database</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search */}
          <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <SearchIcon className="mr-2 h-5 w-5 text-green-400" />
                Search Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <Input
                  type="text"
                  placeholder="Enter username or email address"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-gray-900 border-gray-700 text-white"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <LoaderIcon size={16} className="animate-spin mr-2" />
                      Searching...
                    </span>
                  ) : "Search"}
                </Button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-md flex items-start space-x-2">
                  <AlertCircleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          {!loading && results.length > 0 && (
            <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <DatabaseIcon className="mr-2 h-5 w-5 text-yellow-400" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-400">Total Records</span>
                  <span className="text-2xl font-bold text-white">{totalResults}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-400">Query</span>
                  <span className="text-md font-medium text-white">{query}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-400">Visible Records</span>
                  <span className="text-md font-medium text-white">
                    {paginatedResults.length} of {results.length} (Page {currentPage}/{totalPages})
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {loading ? (
            <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Searching Database</CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingAnimation />
              </CardContent>
            </Card>
          ) : paginatedResults.length > 0 ? (
            <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <DatabaseIcon className="mr-2 h-5 w-5 text-blue-400" />
                  Breach Records
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto rounded-md max-h-[450px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                  <Table>
                    <TableBody>
                      {paginatedResults.map((line, index) => {
                        const setButtonRef = (el: HTMLButtonElement | null) => {
                          copyButtonRef.current[index] = el;
                        };
                        return (
                          <TableRow key={line} className="hover:bg-gray-700 border-gray-700 transition-colors">
                            <TableCell className="p-3 font-medium flex items-center justify-between">
                              <span className="text-red-400 break-all pr-4">{line}</span>
                              <Button
                                ref={setButtonRef}
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(line, index)}
                                title="Copy to clipboard"
                                className="text-gray-400 hover:text-white hover:bg-gray-600 ml-2"
                              >
                                <CopyIcon size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Buttons */}
                <div className="flex justify-center items-center gap-4 mt-4">
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
