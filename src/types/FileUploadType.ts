type Range<
  N extends number,
  Result extends number[] = []
> = Result["length"] extends N
  ? Result[number]
  : Range<N, [...Result, Result["length"]]>;

type MaxFilesRange = Exclude<Range<101>, 0>;
type MaxSizeRange = Exclude<Range<101>, 0>;

/**
 * Base properties for file upload.
 */
type BaseUploadProperties = {
  /**
   * You can set this optional property to make the file upload utility to only handle this particular field.
   */
  fieldName?: string;

  /**
   *Path to store the uploaded file.
   */
  location: string;

  /**
   * Maximum number of files allowed for upload.
   * Values should be between 1 and 100.
   */
  maxFiles: MaxFilesRange;

  /**
   * Maximum file size allowed for uploads.
   * The value is in megabytes (MB).
   * Example: 10 for 10 MB.
   * If not provided, defaults to 100 MB.
   */
  maxSize?: MaxSizeRange;

  /**
   * Mime types that will be checked before uploading the file.
   */
  allowedTypes?: string | string[];

  /**
   * This so far only works for single file upload.
   * If the form data has more than one file, random file name will assigned to each file.
   */
  fileName?: string | null;
};

export type FileUploadProperties = BaseUploadProperties;

type RequireBothOrNoneForSize<T, K extends keyof T> =
  | (T & Required<Pick<T, K>>)
  | (T & Partial<Record<K, undefined>>);

/**
 * Properties for image upload, extending base file upload properties.
 */

export type ImageMimeTypes =
  | "image/png"
  | "image/jpeg"
  | "image/jpg"
  | "image/webp";

export type ImageUploadProperties = BaseUploadProperties &
  RequireBothOrNoneForSize<
    {
      /**
       * This prevents the image from cropping.
       * But this will be ignore if both width and height are set.
       */
      preserveRatio?: boolean;

      /**
       * This property will be used to combine with preserveRatio and scale the image as a whole as per the given value.
       */
      maxWidth?: number;

      /**
       * The width of the image in pixels.
       * Must be provided if height is provided, or vice versa.
       * Example: 600 for 600 pixels wide or do not set both width and height but set preserveRatio true and set maxWith to scale as per the image ratio.
       */
      width?: number;

      /**
       * The height of the image in pixels.
       * Must be provided if width is provided, or vice versa.
       * Example: 600 for 600 pixels tall or do not set both width and height but set preserveRatio true and set maxWith to scale as per the image ratio.
       */
      height?: number;

      /**
       * Mime types that will be checked before uploading the image.
       */
      allowedTypes?: ImageMimeTypes | ImageMimeTypes[];
    },
    "width" | "height"
  >;
