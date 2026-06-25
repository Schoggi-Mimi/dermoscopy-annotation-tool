import moment from 'moment'
import {GeneralSelector} from '../store/selectors/GeneralSelector'
import {saveAs as fileSaveAs} from 'file-saver'

export class ExporterUtil {
    public static getExportFileName(): string {
        const projectName: string = GeneralSelector.getProjectName()
        const date: string = moment().format('YYYY-MM-DD-hh-mm-ss')
        return `labels_${projectName}_${date}`
    }

    public static saveAs(content: string, fileName: string): void {
        const blob = new Blob([content], {type: 'text/plain;charset=utf-8'})
        ExporterUtil.saveBlob(blob, fileName)
    }

    public static saveBlob(blob: Blob, fileName: string, downloadWindow?: Window | null): void {
        console.error('EXPORTER_UTIL_SAVE_BLOB', {
            fileName,
            size: blob.size,
            type: blob.type,
            hasDownloadWindow: !!downloadWindow
        })

        if (downloadWindow && !downloadWindow.closed) {
            ExporterUtil.saveBlobWithPreparedWindow(blob, fileName, downloadWindow)
            return
        }

        try {
            fileSaveAs(blob, fileName)
        } catch (error) {
            console.error('FILE_SAVER_FAILED_USING_ANCHOR', error)
            ExporterUtil.saveBlobWithAnchor(blob, fileName)
        }
    }

    private static saveBlobWithPreparedWindow(blob: Blob, fileName: string, downloadWindow: Window): void {
        const url = URL.createObjectURL(blob)

        const safeFileName = ExporterUtil.escapeHtml(fileName)

        downloadWindow.document.open()
        downloadWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>Download ready</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 32px;
                            background: #111;
                            color: #fff;
                        }

                        a {
                            display: inline-block;
                            margin-top: 20px;
                            padding: 14px 20px;
                            background: #1da1f2;
                            color: white;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <h2>Download ready</h2>
                    <p>If the file does not download automatically, click the button below.</p>
                    <a id="download-link" href="${url}" download="${safeFileName}">
                        Download ${safeFileName}
                    </a>
                    <script>
                        const link = document.getElementById('download-link')
                        link.click()
                    </script>
                </body>
            </html>
        `)
        downloadWindow.document.close()

        window.setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 60000)
    }

    private static saveBlobWithAnchor(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')

        anchor.href = url
        anchor.download = fileName
        anchor.style.display = 'none'

        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)

        window.setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 60000)
    }

    private static escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
    }
}