-- Allow demand planners to insert and update product capacities
CREATE POLICY "Demand planners can insert product capacities"
ON product_capacities
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'demand_planner'::app_role));

CREATE POLICY "Demand planners can update product capacities"
ON product_capacities
FOR UPDATE
USING (has_role(auth.uid(), 'demand_planner'::app_role));