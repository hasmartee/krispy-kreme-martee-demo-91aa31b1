-- Allow demand planners to view all product capacities
CREATE POLICY "Demand planners can view all product capacities"
ON product_capacities
FOR SELECT
USING (has_role(auth.uid(), 'demand_planner'::app_role));