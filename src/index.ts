import { Dic } from './types'
import Path from './Path'
import { Template } from './Template'

export async function Tea(
  template_path: string,
  destination_path: string,
  data: Dic<string>
): Promise<void> {
  try {
    const tpl_path = Path(template_path)
    const dest_path = Path(destination_path)
    await dest_path.accessTo()
    await tpl_path
      .copy(dest_path.path)
      .then(async () => {
        const tpl = Template(dest_path.path)
        await tpl.parse(data)
      })
      .catch((error) => {
        throw error
      })
  } catch (error) {
    throw error
  }
}
