import { useState } from 'react'
import { Upload, FileUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import './App.css'

import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import { Skeleton } from './components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Toaster } from './components/ui/sonner'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validExtensions = ['.pdf', '.docx', '.xlsx', '.pptx', '.html']
      
      if (!validExtensions.some(ext => selectedFile.name.toLowerCase().endsWith(ext))) {
        toast.error("Invalid file format", {
          description: "Please upload a PDF, DOCX, XLSX, PPTX, or HTML file."
        })
        return
      }
      
      setFile(selectedFile)
      setMarkdown(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("No file selected", {
        description: "Please select a file to convert."
      })
      return
    }

    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)

    const endpoint = (() => {
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:8000/tomd'
      }
      return `${window.location.protocol}//api.${window.location.hostname}/tomd`
    })()

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to convert file')
      }

      const data = await response.json()
      setMarkdown(data.content)
      toast.success("Conversion successful", {
        description: `${data.filename} has been converted to Markdown.`
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      toast.error("Conversion failed", {
        description: err instanceof Error ? err.message : 'An unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8">Document to Markdown Converter</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Convert PDF, DOCX, XLSX, PPTX, or HTML files to Markdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF, DOCX, XLSX, PPTX, or HTML
                  </p>
                  {file && (
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.xlsx,.pptx,.html"
                />
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleUpload} disabled={!file || loading}>
              {loading ? 'Converting...' : 'Convert to Markdown'}
              {!loading && <FileUp className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>

        {loading && (
          <Card>
            <CardHeader>
              <CardTitle>Converting...</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {markdown && (
          <Card>
            <CardHeader>
              <CardTitle>Markdown Result</CardTitle>
              <CardDescription>
                Copy the markdown content below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-[500px]">
                <pre className="text-sm whitespace-pre-wrap">{markdown}</pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(markdown);
                  toast.success("Copied to clipboard", {
                    description: "Markdown content has been copied to clipboard."
                  });
                }}
              >
                Copy to Clipboard
              </Button>
            </CardFooter>
          </Card>
        )}
        
        <Toaster />
      </div>
    </div>
  )
}

export default App
