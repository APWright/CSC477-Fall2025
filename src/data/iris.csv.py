import vega_datasets
import sys

vega_datasets.data.iris().to_csv(sys.stdout)
