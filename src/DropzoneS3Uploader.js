import React, { createRef } from 'react'
import PropTypes from 'prop-types'
import S3Upload from 'react-s3-uploader/s3upload'
import Dropzone from 'react-dropzone'

export default class DropzoneS3Uploader extends React.Component {
  dropzone = createRef

  constructor(props) {
    super()

    const { filename } = props
    const uploadedFiles = []

    if (filename) {
      uploadedFiles.push({
        filename,
        fileUrl: this.fileUrl(props.s3Url, filename),
        default: true,
        file: {},
      })
    }

    this.state = {
      uploadedFiles,
      ...DropzoneS3Uploader.getDerivedStateFromProps(props),
    }
  }

  static getDerivedStateFromProps(props) {
    return {
      uploaderOptions: {
        signingUrl: '/s3/sign',
        s3path: '',
        contentDisposition: 'auto',
        uploadRequestHeaders: { 'x-amz-acl': 'public-read' },
        ...props.upload,
      },
    }
  }

  handleProgress = (progress, textState, file) => {
    const { onProgress } = this.props

    if (onProgress) onProgress(progress, textState, file)

    this.setState({ progress })
  }

  handleError = (err, file) => {
    const { onError } = this.props

    if (onError) onError(err, file)

    this.setState({ error: err, progress: null })
  }

  handleFinish = (info, file) => {
    const { onFinish } = this.props

    const uploadedFile = {
      file,
      fileUrl: this.fileUrl(this.props.s3Url, info.filename),
      ...info,
    }

    const { uploadedFiles } = this.state
    uploadedFiles.push(uploadedFile)
    this.uploader = null

    this.setState({ uploadedFiles, error: null, progress: null }, () => {
      if (onFinish) onFinish(uploadedFile)
    })
  }

  handleDrop = (files, rejectedFiles) => {
    const { onDrop } = this.props

    this.setState({ uploadedFiles: [], error: null, progress: null })

    const options = {
      files,
      onFinishS3Put: this.handleFinish,
      onProgress: this.handleProgress,
      onError: this.handleError,
      ...this.state.uploaderOptions,
    }

    this.uploader = new S3Upload(options) // eslint-disable-line

    if (onDrop) onDrop(files, rejectedFiles)
  }

  fileUrl = (s3Url, filename) =>
    `${s3Url.endsWith('/') ? s3Url.slice(0, -1) : s3Url}/${filename}`

  renderImage = ({ uploadedFile }) => (
    <div className="rdsu-image">
      <img alt="rdsu-img" src={uploadedFile.fileUrl} />
    </div>
  )

  renderFile = ({ uploadedFile }) => (
    <div className="rdsu-file">
      <div className="rdsu-file-icon">
        <span className="fa fa-file-o" style={{ fontSize: '50px' }} />
      </div>
      <div className="rdsu-filename">{uploadedFile.file.name}</div>
    </div>
  )

  renderProgress = ({ progress }) =>
    progress ? <div className="rdsu-progress">{progress}</div> : null

  renderError = ({ error }) =>
    error ? <div className="rdsu-error small">{error}</div> : null

  render() {
    const {
      s3Url,
      passChildrenProps,
      children,
      imageComponent,
      fileComponent,
      progressComponent,
      errorComponent,
      ...dropzoneProps
    } = this.props

    const ImageComponent = imageComponent || this.renderImage
    const FileComponent = fileComponent || this.renderFile
    const ProgressComponent = progressComponent || this.renderProgress
    const ErrorComponent = errorComponent || this.renderError

    const { uploadedFiles } = this.state
    const childProps = { s3Url, ...this.state }
    this.props.notDropzoneProps.forEach(prop => delete dropzoneProps[prop])

    let content = null
    if (children) {
      content = passChildrenProps
        ? React.Children.map(children, child =>
            React.cloneElement(child, childProps),
          )
        : this.props.children
    } else {
      content = (
        <div>
          {uploadedFiles.map(uploadedFile => {
            const props = {
              key: uploadedFile.filename,
              uploadedFile,
              ...childProps,
            }
            return this.props.isImage(uploadedFile.fileUrl) ? (
              <ImageComponent {...props} />
            ) : (
              <FileComponent {...props} />
            )
          })}
          <ProgressComponent {...childProps} />
          <ErrorComponent {...childProps} />
        </div>
      )
    }

    return (
      <Dropzone ref={this.dropzone} onDrop={this.handleDrop} {...dropzoneProps}>
        {content}
      </Dropzone>
    )
  }
}

DropzoneS3Uploader.defaultProps = {
  children: null,
  upload: {},
  passChildrenProps: true,
  isImage: filename => filename && filename.match(/\.(jpeg|jpg|gif|png|svg)/i),
  notDropzoneProps: [
    'onFinish',
    's3Url',
    'filename',
    'host',
    'upload',
    'isImage',
    'notDropzoneProps',
  ],
  filename: null,
  fileComponent: null,
  errorComponent: null,
  imageComponent: null,
  progressComponent: null,
  onDrop: null,
  onError: null,
  onFinish: null,
  onProgress: null,
}

DropzoneS3Uploader.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  errorComponent: PropTypes.func,

  fileComponent: PropTypes.func,
  filename: PropTypes.string,
  imageComponent: PropTypes.func,
  isImage: PropTypes.func,

  notDropzoneProps: PropTypes.array,
  passChildrenProps: PropTypes.bool,
  progressComponent: PropTypes.func,

  s3Url: PropTypes.string.isRequired,

  upload: PropTypes.object,
  onDrop: PropTypes.func,
  onError: PropTypes.func,
  onFinish: PropTypes.func,

  // Passed to react-s3-uploader
  onProgress: PropTypes.func,
}
