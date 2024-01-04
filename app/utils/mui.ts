import type { Theme as MUITheme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import type { TypedSxProp } from '@/styles/theme';

/**
 * @description
 * The `createStyles` function is a utility that allows you to create styles for
 * your components without having to cast the object to const or pass the style
 * object directly to the `sx` prop. It helps to make your code cleaner and
 * easier to read by inferring the correct types.
 *
 * @see Check {@link https://mui.com/system/getting-started/the-sx-prop/#typescript-usage | MUI's docs} for more information.
 *
 * @example
 * ```tsx
 * const styles = createStyles({
 *   root: {
 *     color: 'red',
 *     '&:hover': {
 *       color: 'blue',
 *     },
 *   },
 * });
 *
 * const Component = () => <Box sx={styles.root} />;
 * ```
 */
export const createStyles = <StylesToBeInferred extends TypedSxProp>(
  styles: StylesToBeInferred,
) => styles;

/**
 * The `mergeExternalSxPropDeclaration` is a utility function that helps to
 * handle `sx` prop merging when passing it down to an MUI component. It ensures
 * that the `sx` prop is always formatted as an array, regardless of whether it
 * was originally an array or an object.
 *
 * @see Check {@link https://mui.com/system/getting-started/the-sx-prop/#passing-the-sx-prop | MUI's docs} for more information.
 *
 * @example
 * ```tsx
 * const ListHeader = ({ sx = [], children }: ListHeaderProps) => (
 *   <ListItem
 *     sx={[
 *       { textDecoration: 'underline', width: 'auto' },
 *       // Use the `mergeExternalSxPropDeclaration` function to handle the `sx` prop
 *       ...mergeExternalSxPropDeclaration(sx),
 *     ]}
 *   >
 *     <FormLabel sx={{ color: 'inherit' }}>{children}</FormLabel>
 *   </ListItem>
 * );
 * ```
 */
export const mergeExternalSxPropDeclaration = (
  externalSxProp: SxProps<MUITheme>,
) => (externalSxProp instanceof Array ? externalSxProp : [externalSxProp]);
